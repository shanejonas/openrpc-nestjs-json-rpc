import { RpcDiscoverService } from './rpc.discover.service';
import { RpcMethod, RpcService } from '../decorators';

@RpcService({
  namespace: 'rpc',
})
export class RpcDiscoverController {
  constructor(private rpcDiscoverService: RpcDiscoverService) {}

  @RpcMethod()
  public async discover(params: {}) {
    return this.rpcDiscoverService.getOpenRPCDocument();
  }
}