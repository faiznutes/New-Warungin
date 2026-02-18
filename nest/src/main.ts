import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { AppModule } from "./app.module";
import { GlobalExceptionFilter } from "./common/filters/global-exception.filter";
import { ResponseInterceptor } from "./common/interceptors/response.interceptor";
import { PerformanceMonitoringInterceptor } from "./common/interceptors/performance-monitoring.interceptor";
import { EnhancedValidationPipe } from "./common/pipes/enhanced-validation.pipe";
import { LoggerService } from "./common/logger/logger.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const config = app.get(ConfigService);
  const logger = app.get(LoggerService);

  app.useLogger(logger);

  // Security: Helmet middleware
  app.use(helmet());

  // Rate Limiting - Global
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use("/api/", limiter);

  // Rate Limiting - Auth endpoints (stricter)
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    skipSuccessfulRequests: true, // don't count successful requests
    message: "Too many login attempts, please try again later.",
  });
  app.use("/api/auth/login", authLimiter);
  app.use("/api/auth/register", authLimiter);

  app.setGlobalPrefix("api", { exclude: ["health"] });

  // Enhanced validation with field-level error reporting
  app.useGlobalPipes(
    new EnhancedValidationPipe(),
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global filters and interceptors (order matters!)
  // Filters: catch exceptions
  // Interceptors: wrap responses and monitor performance
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(
    new ResponseInterceptor(),
    new PerformanceMonitoringInterceptor(),
  );

  app.enableCors({
    origin: config
      .get("CORS_ORIGIN", "http://localhost:5173")
      .split(",")
      .map((o: string) => o.trim()),
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "X-Correlation-ID",
    ],
    exposedHeaders: ["Content-Disposition", "Content-Type", "Content-Length"],
  });

  const port = parseInt(
    config.get<string>("PORT") || process.env.PORT || "3000",
    10,
  );

  // Enable graceful shutdown
  const server = await app.listen(port);

  process.on("SIGTERM", async () => {
    logger.warn("SIGTERM received, shutting down gracefully...", "Bootstrap");
    await app.close();
    server.close(() => {
      logger.log("Server closed", "Bootstrap");
      process.exit(0);
    });
  });

  logger.log(
    `✅ NestJS backend running on http://localhost:${port}/api`,
    "Bootstrap",
  );
}

bootstrap().catch((err) => {
  console.error("Failed to start NestJS:", err);
  process.exit(1);
});
