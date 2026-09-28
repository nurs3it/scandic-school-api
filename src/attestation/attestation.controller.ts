import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AttestationService } from './attestation.service';

@ApiTags('attestation')
@Controller('attestation')
export class AttestationController {
  constructor(private readonly attestation: AttestationService) {}

  @Get()
  @ApiOkResponse({
    description: 'Active attestation sections as a nested tree, with files',
  })
  tree() {
    return this.attestation.findTreePublic();
  }
}
