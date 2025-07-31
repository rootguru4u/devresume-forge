# AWS SQS (Simple Queue Service) Guide

## Table of Contents
1. [What is SQS?](#what-is-sqs)
2. [Types of Queues](#types-of-queues)
3. [Architecture Patterns](#architecture-patterns)
4. [Implementation Guide](#implementation-guide)
5. [Best Practices](#best-practices)
6. [Monitoring & Troubleshooting](#monitoring--troubleshooting)

## What is SQS?

Amazon Simple Queue Service (SQS) is a fully managed message queuing service that enables decoupling and scaling of distributed systems and serverless applications.

### Basic Concept
```
Producer                    SQS Queue                    Consumer
┌──────────┐            ┌──────────────┐            ┌──────────┐
│ Frontend │──Message──►│ Message Queue │──Message──►│ Backend  │
└──────────┘            └──────────────┘            └──────────┘
     │                         │                          │
     │                         │                          │
     └─────────────────────────┼──────────────────────────┘
                               │
                        Message Retention
                        (Up to 14 days)
```

### Key Features
```
┌─────────────────────────────────────────────────┐
│               SQS Key Features                  │
├─────────────┬─────────────────┬────────────────┤
│ Durability  │ Scalability     │ Security       │
├─────────────┼─────────────────┼────────────────┤
│ Redundant   │ Auto-scaling    │ IAM            │
│ Storage     │ High throughput │ Encryption     │
│ At-least    │ Unlimited      │ VPC Endpoints  │
│ once        │ queues & msgs   │ KMS           │
└─────────────┴─────────────────┴────────────────┘
```

## Types of Queues

### 1. Standard Queue
```
┌──────────┐     ┌──────────────┐     ┌──────────┐
│Producer 1│────►│              │────►│Consumer 1│
└──────────┘     │              │     └──────────┘
┌──────────┐     │   Standard   │     ┌──────────┐
│Producer 2│────►│    Queue     │────►│Consumer 2│
└──────────┘     │              │     └──────────┘
                 │ (At least    │
┌──────────┐     │  once)       │     ┌──────────┐
│Producer 3│────►│              │────►│Consumer 3│
└──────────┘     └──────────────┘     └──────────┘

Features:
- Unlimited Throughput
- At-least-once delivery
- Best-effort ordering
```

### 2. FIFO Queue
```
┌──────────┐     ┌──────────────┐     ┌──────────┐
│Producer 1│────►│              │────►│Consumer 1│
└──────────┘     │    FIFO      │     └──────────┘
                 │    Queue     │
┌──────────┐     │              │     ┌──────────┐
│Producer 2│────►│ (Exactly     │────►│Consumer 2│
└──────────┘     │  once)       │     └──────────┘
                 └──────────────┘

Features:
- Exactly-once processing
- First-In-First-Out delivery
- 300 messages/second (without batching)
- 3000 messages/second (with batching)
```

## Architecture Patterns

### 1. Basic Request-Response Pattern
```
┌──────────┐    Request    ┌──────────┐    Process    ┌──────────┐
│ Client   │─────Queue────►│ Worker   │─────────────►│ Database │
└──────────┘              └──────────┘              └──────────┘
      ▲                        │
      │                        │
      └────────Response───────┘
           Queue
```

### 2. Fan-Out Pattern
```
                 ┌──────────┐
                 │Consumer 1│
┌──────────┐     └──────────┘
│          │     ┌──────────┐
│ Producer │────►│Consumer 2│
│          │     └──────────┘
└──────────┘     ┌──────────┐
                 │Consumer 3│
                 └──────────┘
```

### 3. Priority Queue Pattern
```
High Priority Queue
┌────────────────┐
│ Critical Jobs  │────┐
└────────────────┘    │    ┌──────────┐
                      ├────►│ Worker   │
┌────────────────┐    │    └──────────┘
│ Regular Jobs   │────┘
└────────────────┘
Low Priority Queue
```

## Implementation Guide

### 1. Setting Up SQS Queue

```typescript
// AWS SDK v3 Setup
import { SQSClient, CreateQueueCommand } from '@aws-sdk/client-sqs';

const sqsClient = new SQSClient({ region: 'us-east-1' });

// Create Standard Queue
const createStandardQueue = async () => {
  const command = new CreateQueueCommand({
    QueueName: 'devresume-standard-queue',
    Attributes: {
      MessageRetentionPeriod: '86400', // 1 day
      VisibilityTimeout: '30',         // 30 seconds
    }
  });
  
  return await sqsClient.send(command);
};

// Create FIFO Queue
const createFifoQueue = async () => {
  const command = new CreateQueueCommand({
    QueueName: 'devresume-fifo-queue.fifo', // Must end with .fifo
    Attributes: {
      FifoQueue: 'true',
      ContentBasedDeduplication: 'true',
      MessageRetentionPeriod: '86400',
      VisibilityTimeout: '30'
    }
  });
  
  return await sqsClient.send(command);
};
```

### 2. Sending Messages

```typescript
import { SendMessageCommand } from '@aws-sdk/client-sqs';

// Send to Standard Queue
const sendToStandardQueue = async (messageBody: string) => {
  const command = new SendMessageCommand({
    QueueUrl: 'YOUR_QUEUE_URL',
    MessageBody: messageBody,
    DelaySeconds: 0,
    MessageAttributes: {
      'MessageType': {
        DataType: 'String',
        StringValue: 'RESUME_UPDATE'
      }
    }
  });
  
  return await sqsClient.send(command);
};

// Send to FIFO Queue
const sendToFifoQueue = async (messageBody: string, groupId: string) => {
  const command = new SendMessageCommand({
    QueueUrl: 'YOUR_FIFO_QUEUE_URL',
    MessageBody: messageBody,
    MessageGroupId: groupId,           // Required for FIFO
    MessageDeduplicationId: Date.now().toString(), // Optional if ContentBasedDeduplication is enabled
  });
  
  return await sqsClient.send(command);
};
```

### 3. Receiving Messages

```typescript
import { ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';

const processMessages = async () => {
  const command = new ReceiveMessageCommand({
    QueueUrl: 'YOUR_QUEUE_URL',
    MaxNumberOfMessages: 10,
    WaitTimeSeconds: 20,  // Long polling
    MessageAttributeNames: ['All']
  });

  try {
    const response = await sqsClient.send(command);
    
    for (const message of response.Messages || []) {
      // Process message
      await processMessage(message);
      
      // Delete message after processing
      await sqsClient.send(new DeleteMessageCommand({
        QueueUrl: 'YOUR_QUEUE_URL',
        ReceiptHandle: message.ReceiptHandle
      }));
    }
  } catch (error) {
    console.error('Error processing messages:', error);
  }
};
```

### 4. Error Handling with Dead Letter Queue (DLQ)
```
Main Queue                     Dead Letter Queue
┌──────────┐    Failed      ┌──────────────────┐
│ Messages │───Processing───►│ Failed Messages  │
└──────────┘               └──────────────────┘
```

```typescript
// Create DLQ
const createDLQ = async () => {
  const dlqCommand = new CreateQueueCommand({
    QueueName: 'devresume-dlq'
  });
  
  const dlqResult = await sqsClient.send(dlqCommand);
  
  // Update main queue to use DLQ
  const updateQueueCommand = new SetQueueAttributesCommand({
    QueueUrl: 'MAIN_QUEUE_URL',
    Attributes: {
      RedrivePolicy: JSON.stringify({
        deadLetterTargetArn: dlqResult.QueueArn,
        maxReceiveCount: 3
      })
    }
  });
  
  await sqsClient.send(updateQueueCommand);
};
```

## Best Practices

### 1. Message Design
```yaml
Good Message Structure:
  messageId: "unique-id"
  type: "RESUME_UPDATE"
  data:
    userId: "123"
    action: "UPDATE"
    payload: {}
  timestamp: "2024-01-20T10:00:00Z"
  version: "1.0"
```

### 2. Batch Processing
```typescript
// Batch Send Messages
const batchSendMessages = async (messages: string[]) => {
  const command = new SendMessageBatchCommand({
    QueueUrl: 'YOUR_QUEUE_URL',
    Entries: messages.map((msg, index) => ({
      Id: `msg${index}`,
      MessageBody: msg
    }))
  });
  
  return await sqsClient.send(command);
};
```

### 3. Visibility Timeout Management
```
Message Lifecycle
┌──────────┐    ┌───────────┐    ┌──────────┐
│ Received │───►│Processing │───►│ Deleted  │
└──────────┘    └───────────┘    └──────────┘
                      │
                      │ Timeout
                      ▼
                ┌──────────┐
                │ Back in  │
                │  Queue   │
                └──────────┘
```

## Monitoring & Troubleshooting

### 1. CloudWatch Metrics
```yaml
Key Metrics to Monitor:
  - NumberOfMessagesSent
  - NumberOfMessagesReceived
  - NumberOfMessagesDeleted
  - ApproximateNumberOfMessagesVisible
  - ApproximateAgeOfOldestMessage
```

### 2. Alerts Setup
```typescript
// CloudWatch Alarm Example
const createQueueAlarm = async () => {
  const alarm = new PutMetricAlarmCommand({
    AlarmName: 'QueueDepthAlarm',
    ComparisonOperator: 'GreaterThanThreshold',
    EvaluationPeriods: 1,
    MetricName: 'ApproximateNumberOfMessagesVisible',
    Namespace: 'AWS/SQS',
    Period: 300,
    Statistic: 'Average',
    Threshold: 100,
    ActionsEnabled: true,
    AlarmActions: ['SNS_TOPIC_ARN']
  });
  
  await cloudWatchClient.send(alarm);
};
```

### 3. Common Issues and Solutions
```
┌────────────────────┐    ┌────────────────────┐
│      Issue         │    │     Solution       │
├────────────────────┤    ├────────────────────┤
│ Messages stuck     │───►│ Check visibility   │
│                    │    │ timeout            │
├────────────────────┤    ├────────────────────┤
│ Duplicate messages │───►│ Enable dedup IDs   │
│                    │    │ for FIFO           │
├────────────────────┤    ├────────────────────┤
│ Message loss      │───►│ Verify delete      │
│                    │    │ after processing   │
└────────────────────┘    └────────────────────┘
```

### Example Use Case in Our Project

```typescript
// Resume Processing Queue
interface ResumeUpdateMessage {
  userId: string;
  resumeId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  template?: string;
  data: any;
}

// Producer (Frontend)
const queueResumeUpdate = async (message: ResumeUpdateMessage) => {
  await sendToFifoQueue(
    JSON.stringify(message),
    `user-${message.userId}`  // Group ID ensures order per user
  );
};

// Consumer (Backend)
const processResumeUpdates = async () => {
  while (true) {
    const messages = await receiveMessages();
    
    for (const message of messages) {
      const update: ResumeUpdateMessage = JSON.parse(message.Body);
      
      try {
        switch (update.action) {
          case 'CREATE':
            await createResume(update);
            break;
          case 'UPDATE':
            await updateResume(update);
            break;
          case 'DELETE':
            await deleteResume(update);
            break;
        }
        
        await deleteMessage(message);
      } catch (error) {
        // Message will be retried or sent to DLQ
        console.error('Failed to process resume update:', error);
      }
    }
  }
};
```

## DevResume-Forge SQS Integration

### Why We Need SQS in Our Project
```
Common Resume Builder Issues Without SQS:
┌────────────────────────┐    ┌────────────────────────┐
│ Direct API Processing  │    │ Potential Problems     │
├────────────────────────┤    ├────────────────────────┤
│ ❌ High Server Load    │───►│ Server Crashes         │
│ ❌ PDF Generation Slow │───►│ Timeouts              │
│ ❌ Bulk Updates Fail   │───►│ Data Loss             │
│ ❌ No Retry Mechanism  │───►│ Failed Operations     │
└────────────────────────┘    └────────────────────────┘
```

### SQS Solution in Our Architecture
```
                                     AWS Cloud Infrastructure
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│  Frontend (React)          SQS Queues               Backend (Node.js)           │
│  ┌──────────────┐    ┌─────────────────┐    ┌───────────────────────┐         │
│  │ Resume       │───►│ Resume Updates  │───►│ Update Processor      │         │
│  │ Editor       │    │ (FIFO Queue)    │    │ (ECS/Lambda)          │         │
│  └──────────────┘    └─────────────────┘    └───────────┬───────────┘         │
│         │                                               │                       │
│         │            ┌─────────────────┐                │                       │
│         └──────────►│ PDF Generation  │────────────────┤                       │
│                     │ (Standard Queue) │                │                       │
│                     └─────────────────┘                │                       │
│                                                        ▼                       │
│                     ┌─────────────────┐    ┌───────────────────────┐         │
│                     │ Failed Jobs     │◄───│ Error Handler         │         │
│                     │ (DLQ)           │    │ (Retry Logic)         │         │
│                     └─────────────────┘    └───────────────────────┘         │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
```

### Detailed Message Flow
```
User Action                 SQS Processing               Backend Processing
┌──────────────┐        ┌──────────────────┐         ┌──────────────────┐
│Update Resume │        │Message Published  │         │Process Update    │
│  - Content   ├───────►│  - Queued        ├────────►│  - Save to DB    │
│  - Template  │        │  - Deduped (FIFO)│         │  - Update Search │
└──────────────┘        └──────────────────┘         └──────────┬───────┘
       │                                                        │
       │                ┌──────────────────┐         ┌─────────▼───────┐
       └───────────────►│PDF Queue         │         │Generate PDF     │
                       │  - Async Process  ├────────►│  - Render      │
                       │  - Can Retry      │         │  - Store in S3 │
                       └──────────────────┘         └───────────────┬─┘
                                                                   │
                       ┌──────────────────┐         ┌─────────────▼─┐
                       │Notification      │         │Send Email     │
                       │Queue             │◄────────┤to User        │
                       └──────────────────┘         └───────────────┘
```

### Key Integration Points
```
1. Resume Updates (FIFO Queue)
┌────────────────────────────────────────┐
│ Why FIFO?                              │
│ - Maintain order of updates            │
│ - Prevent duplicate processing         │
│ - Ensure data consistency              │
└────────────────────────────────────────┘

2. PDF Generation (Standard Queue)
┌────────────────────────────────────────┐
│ Why Standard?                          │
│ - Higher throughput needed             │
│ - Order not critical                   │
│ - Can handle parallel processing       │
└────────────────────────────────────────┘

3. Error Handling (DLQ)
┌────────────────────────────────────────┐
│ Benefits:                              │
│ - Captures failed operations           │
│ - Enables manual review                │
│ - Supports retry mechanisms            │
└────────────────────────────────────────┘
```

### Scaling Benefits
```
Without SQS                     With SQS
┌──────────┐                   ┌──────────┐
│ 100 Users│                   │ 100 Users│
└────┬─────┘                   └────┬─────┘
     │                              │
     ▼                              ▼
┌──────────┐                   ┌──────────┐
│ Direct   │                   │ Queue    │
│ API Calls│                   │ Buffer   │
└────┬─────┘                   └────┬─────┘
     │                              │
     ▼                              ▼
┌──────────┐                   ┌──────────┐
│ Server   │                   │ Auto-    │
│ Overload │                   │ Scaling  │
└──────────┘                   └──────────┘
```

### Implementation Benefits
```
┌─────────────────────────────────────────────────────────┐
│                   Business Benefits                      │
├───────────────────┬─────────────────┬──────────────────┤
│ Reliability       │ Performance     │ Cost Efficiency   │
├───────────────────┼─────────────────┼──────────────────┤
│ ✓ No Data Loss   │ ✓ Fast UI      │ ✓ Pay Per Use    │
│ ✓ Retry Logic    │ ✓ Background   │ ✓ Auto-scaling   │
│ ✓ Consistency    │   Processing    │ ✓ Resource      │
│                   │                 │   Optimization   │
└───────────────────┴─────────────────┴──────────────────┘
```

This guide provides a comprehensive understanding of AWS SQS and its implementation in our project. For specific questions or scenarios, please refer to the relevant sections or ask for clarification. 