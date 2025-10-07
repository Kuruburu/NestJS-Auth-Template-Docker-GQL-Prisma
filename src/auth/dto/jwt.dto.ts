import { JwtPayloadDto } from './jwt-payload.dto';

export interface JwtDto extends JwtPayloadDto {
  /**
   * Issued at
   */
  iat: number;
  /**
   * Expiration time
   */
  exp: number;
}
