import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('0. Health Check')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Health check', description: 'Check if the API server is running' })
  @ApiResponse({
    status: 200,
    description: 'Server is healthy',
    schema: {
      example: {
        status: 'ok',
        message: 'API is running',
        timestamp: '2026-01-19T10:47:00.000Z',
      },
    },
  })
  getHealth() {
    return {
      status: 'ok',
      message: 'API is running',
      timestamp: new Date().toISOString(),
    };
  }
}
