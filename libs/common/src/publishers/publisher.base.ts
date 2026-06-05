import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';

export type ExchangeType = 'fanout' | 'topic' | 'direct' | 'headers';

export abstract class BasePublisher implements OnModuleInit, OnModuleDestroy {
  protected abstract readonly exchange: string;
  protected abstract readonly exchangeType: ExchangeType;

  private connection: amqp.ChannelModel;
  private channel: amqp.Channel;

  constructor(protected readonly configService: ConfigService) {}

  async onModuleInit() {
    try {
      this.connection = await amqp.connect(
        this.configService.getOrThrow<string>('RABBITMQ_URL'),
      );

      this.channel = await this.connection.createChannel();
      await this.channel.assertExchange(this.exchange, this.exchangeType, {
        durable: true,
      });
    } catch (error) {
      console.error(`[BasePublisher] Error initializing: ${error}`);
    }
  }

  publish(pattern: string, data: unknown) {
    const routingKey = this.exchangeType === 'fanout' ? '' : pattern;

    this.channel.publish(
      this.exchange,
      routingKey,
      Buffer.from(JSON.stringify({ pattern, data })),
      { persistent: true },
    );
  }

  async onModuleDestroy() {
    await this.channel?.close();
    await this.connection?.close();
  }
}
