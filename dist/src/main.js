"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: ['https://mw265.com', 'http://localhost:3001'],
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });
    app.setGlobalPrefix('api');
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl) {
        const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ':****@');
        console.log(`[Bootstrap] Using DATABASE_URL: ${maskedUrl}`);
    }
    else {
        console.error('[Bootstrap] CRITICAL: DATABASE_URL is not defined!');
    }
    const port = process.env.PORT || 3002;
    await app.listen(port);
    console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap().catch(err => {
    console.error('Fatal Error during bootstrap:', err);
    process.exit(1);
});
//# sourceMappingURL=main.js.map