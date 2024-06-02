import { ArgumentsHost, Catch } from "@nestjs/common";
import { BaseWsExceptionFilter, WsException } from "@nestjs/websockets";


@Catch(WsException)
export class WebSocketExceptionFilter extends BaseWsExceptionFilter {
    catch(exception: any, host: ArgumentsHost): void {
        const args = host.getArgs()

        if("function" === typeof args[args.length - 1]) {
            const ACKCallback = args.pop()
            ACKCallback({ error: exception.message, exception})
        }
    }
}