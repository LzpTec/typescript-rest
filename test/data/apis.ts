'use strict';
import { GET, Path } from '../../src/typescript-rest';


@Path('simplepath')
export class SimpleService {
    @GET
    public test(): string {
        return 'simpleservice';
    }

    @GET
    @Path('secondpath')
    public test2(): string {
        return 'simpleservice';
    }
}
