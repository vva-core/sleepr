import * as amqp from 'amqplib';
import type { ExchangeType } from '../publishers';

export interface RmqExchangeDefinition {
  name: string;
  type: ExchangeType;
  options?: amqp.Options.AssertExchange;
}

export interface RmqQueueDefinition {
  name: string;
  options?: amqp.Options.AssertQueue;
}

export interface RmqBindingDefinition {
  queue: string;
  exchange: string;
  pattern: string;
}

export interface RmqTopology {
  exchanges?: RmqExchangeDefinition[];
  queues?: RmqQueueDefinition[];
  bindings?: RmqBindingDefinition[];
}

/**
 * Opens a short-lived connection/channel to RabbitMQ, declares the requested
 * exchanges, queues and bindings, then tears everything down again.
 *
 * Intended for use during application bootstrap to make sure the broker
 * topology a service depends on exists before it starts consuming.
 */
export async function setupRmqTopology(
  url: string,
  topology: RmqTopology,
): Promise<void> {
  const connection = await amqp.connect(url);
  try {
    const channel = await connection.createChannel();
    try {
      for (const exchange of topology.exchanges ?? []) {
        await channel.assertExchange(
          exchange.name,
          exchange.type,
          exchange.options,
        );
      }

      for (const queue of topology.queues ?? []) {
        await channel.assertQueue(queue.name, queue.options);
      }

      for (const binding of topology.bindings ?? []) {
        await channel.bindQueue(
          binding.queue,
          binding.exchange,
          binding.pattern,
        );
      }
    } finally {
      await channel.close();
    }
  } finally {
    await connection.close();
  }
}
