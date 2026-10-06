import { Body, Controller, Get, HttpCode, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiDocs } from '../common/decorators/api-docs.decorator';
import { ZodPipe } from '../common/pipes/zod-validation.pipe';
import {
  applicationDraftPatchSchema,
  createApplicationBodySchema,
  listApplicationsQuerySchema,
  ApplicationDraftPatch,
  ListApplicationsQuery,
} from './application.schemas';
import { ApplicationsService } from './applications.service';
import { createApplicationSwagger } from './swagger/create-application.swagger';
import { getApplicationSwagger } from './swagger/get-application.swagger';
import { listApplicationsSwagger } from './swagger/list-applications.swagger';
import { submitApplicationSwagger } from './swagger/submit-application.swagger';
import { updateApplicationSwagger } from './swagger/update-application.swagger';

@ApiTags('applications')
@Controller('api/applications')
export class ApplicationsController {
  constructor(
    @Inject(ApplicationsService)
    private readonly applicationsService: ApplicationsService,
  ) {}

  @Get()
  @ApiDocs(listApplicationsSwagger)
  list(@Query(ZodPipe(listApplicationsQuerySchema)) query: ListApplicationsQuery) {
    return this.applicationsService.list(query);
  }

  @Get(':id')
  @ApiDocs(getApplicationSwagger)
  get(@Param('id') id: string) {
    return this.applicationsService.getById(id);
  }

  @Post()
  @ApiDocs(createApplicationSwagger)
  create(@Body(ZodPipe(createApplicationBodySchema)) _body: unknown) {
    return this.applicationsService.create();
  }

  @Patch(':id')
  @ApiDocs(updateApplicationSwagger)
  update(
    @Param('id') id: string,
    @Body(ZodPipe(applicationDraftPatchSchema)) body: ApplicationDraftPatch,
  ) {
    return this.applicationsService.update(id, body);
  }

  @Post(':id/submit')
  @HttpCode(200)
  @ApiDocs(submitApplicationSwagger)
  submit(@Param('id') id: string) {
    return this.applicationsService.submit(id);
  }
}
