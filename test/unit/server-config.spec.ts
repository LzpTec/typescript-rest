'use strict';

import chai from 'chai';
import 'mocha';
import path from 'path';
import proxyquire from 'proxyquire';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);
const expect = chai.expect;

// tslint:disable:no-unused-expression
describe('ServerConfig', () => {
    let fsStub: sinon.SinonStubbedInstance<any>;
    let serverStub: sinon.SinonStubbedInstance<any>;
    let ServerConfig: any;

    beforeEach(() => {
        fsStub = sinon.stub({
            existsSync: (file: string) => true,
            readJSONSync: (file: string) => this
        });
        serverStub = sinon.stub({
            registerServiceFactory: (serviceFactory: any) => this,
            useIoC: (es6: boolean) => true
        });

        ServerConfig = proxyquire('../../src/server/config', {
            './server': { Server: serverStub },
            'fs-extra': fsStub
        }).ServerConfig;
    });

    afterEach(() => {
        fsStub.existsSync.restore();
        fsStub.readJSONSync.restore();
        serverStub.registerServiceFactory.restore();
        serverStub.useIoC.restore();
    });

    it('should use a custom service factory if configured', async () => {
        const config = {
            serviceFactory: 'myCustomFactory'
        };

        fsStub.existsSync.onCall(0).returns(false);
        fsStub.existsSync.onCall(1).returns(true);
        fsStub.existsSync.onCall(2).returns(true);
        fsStub.readJSONSync.returns(config);
        ServerConfig.configure();

        expect(serverStub.useIoC).to.not.have.been.called;
        expect(serverStub.registerServiceFactory).to.have.been.calledOnceWithExactly(config.serviceFactory);
    });

    it('should use a custom service factory configured with relative path', async () => {
        const config = {
            serviceFactory: './myCustomFactory'
        };
        const expectedServicePath = path.join(process.cwd(), config.serviceFactory);

        fsStub.existsSync.onCall(0).returns(false);
        fsStub.existsSync.onCall(1).returns(true);
        fsStub.existsSync.onCall(2).returns(true);
        fsStub.readJSONSync.returns(config);
        ServerConfig.configure();

        expect(serverStub.useIoC).to.not.have.been.called;
        expect(serverStub.registerServiceFactory).to.have.been.calledOnceWithExactly(expectedServicePath);
    });

    it('should not use ioc if an error occur while searching for config file', async () => {
        const consoleStub = sinon.stub(console, 'error');
        try {
            const error = new Error("Some error");
            fsStub.existsSync.throws(error);
            ServerConfig.configure();

            expect(serverStub.useIoC).to.not.have.been.called;
            expect(serverStub.registerServiceFactory).to.not.have.been.called;
            expect(consoleStub).to.have.been.calledOnceWithExactly(error);
        } finally {
            consoleStub.restore();
        }
    });
});