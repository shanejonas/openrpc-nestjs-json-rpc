import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@golevelup/nestjs-discovery';
import { RpcDiscoverService } from './rpc.discover.service';

@Module({
  imports: [DiscoveryModule, DiscoveryModule],
  providers: [RpcDiscoverService],
  exports: [RpcDiscoverService],
})
export class RpcDiscoverModule {}
