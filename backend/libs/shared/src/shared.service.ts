import { Injectable } from "@nestjs/common";

@Injectable()
export class SharedService {
  sayHelloFromShared(): void {
    console.log(`hello`);
  }
}
