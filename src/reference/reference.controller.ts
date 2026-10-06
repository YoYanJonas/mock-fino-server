import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiDocs } from '../common/decorators/api-docs.decorator';
import { COUNTRIES, INDUSTRIES, TRANSFER_COUNTRIES } from './reference.data';
import { countriesSwagger } from './swagger/countries.swagger';
import { industriesSwagger } from './swagger/industries.swagger';
import { transferCountriesSwagger } from './swagger/transfer-countries.swagger';

@ApiTags('reference')
@Controller('api/reference')
export class ReferenceController {
  @Get('countries')
  @ApiDocs(countriesSwagger)
  countries() {
    return { items: COUNTRIES };
  }

  @Get('industries')
  @ApiDocs(industriesSwagger)
  industries() {
    return { items: INDUSTRIES };
  }

  @Get('transfer-countries')
  @ApiDocs(transferCountriesSwagger)
  transferCountries() {
    return { items: TRANSFER_COUNTRIES };
  }
}
