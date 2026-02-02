import express, { Application } from "express";
import path from "path";
import  {dirname} from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";
import cors from "cors";
import { IWhatsAppInstanceRepository } from "@domain/Repositories/IWhatsAppInstanceRepository";
import { BaileysConnectionManager } from "@infrastructure/Baileys/BaileysConnectionManager";
import { errorMiddleware } from "./Middlewares/ErrorMiddleware";
import { loggerMiddleware } from "./Middlewares/LoggerMiddleware";
import { createGroupRouter } from "./Routes/group.routes";
import { createInstanceRouter } from "./Routes/instance.routes";
import { createMessageRouter } from "./Routes/message.routes";
import { createMultimediaRouter } from "./Routes/multimedia.routes";
import { Logger } from "@infrastructure/Logger/Logger";

export const createApp = (
    repository: IWhatsAppInstanceRepository,
    connectionManager: BaileysConnectionManager,
    logger:Logger
): Application => {
    const app = express();

    // Middleware global
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ extended: true, limit: '50mb' }));
    app.use(helmet());
    app.use(cors({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    }));
    
    const loggerMiddlewareHandler = loggerMiddleware(logger);
    app.use(loggerMiddlewareHandler);
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    
    //views temporal
    app.set('view engine', 'ejs')
    app.set('views', path.join(__dirname, '../Views'))
        

    // Health check
    app.get('/health', (req, res) => {
        res.json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        });
    });

    // Routes
    app.use('/api/v1/instances', createInstanceRouter(repository, connectionManager));
    app.use('/api/v1/messages', createMessageRouter(repository, connectionManager));
    app.use('/api/v1/multimedia', createMultimediaRouter(repository, connectionManager));
    app.use('/api/v1/groups', createGroupRouter(repository, connectionManager));

    // Error handling
    const errorHandler = errorMiddleware(logger)
    app.use(errorHandler);

    return app;
};

