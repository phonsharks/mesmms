import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class SensorReading {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  deviceId: string;

  @Column('decimal', { precision: 10, scale: 2 })
  value: number;

  @Column()
  timestamp: string;

  @CreateDateColumn()
  createdAt: Date;
}
