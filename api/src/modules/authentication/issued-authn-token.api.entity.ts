import { User } from 'modules/users/user.api.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('issued_authn_tokens')
/**
 * Log of JWT tokens issued.
 *
 * This is used to implement validation of tokens presented to the API by API
 * clients, so that tokens can be easily revoked. This is particularly useful
 * for rotation of long-lived JWT tokens as may be used as API keys for bots or
 * cross-authentication between microservices.
 *
 * Revoking JWT tokens can currently be done by deleting all of the logged
 * IssuedAuthnToken records for a user (useful for ensuring that a user is
 * logged out of all their open sessions, if needed), or specific ones (may be
 * useful for long-lived JWT tokens).
 *
 * @TODO The actual "revoke" functionality (API endpoint to delete
 * IssuedAuthnToken) needs to be implemented.
 */
export class IssuedAuthnToken {
  /**
   * Ids of IssuedAuthToken records are UUIDv4 which are added to the actual
   * JWT token to link the log of issuance with the issued JWTs.
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * The user to which this token has been issued.
   */
  @ManyToOne((_type) => User, (user) => user.issuedAuthnTokens)
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
  })
  userId: string;

  /**
   * Expiration timestamp of the issued token.
   *
   * This is calculated from the token validity time interval expression
   * configured for the JWT token, *before* the actual JWT is created and
   * signed, so there may be a tiny (likely milliseconds or less) discrepancy
   * from the `exp` timestamp included in the JWT.
   *
   * As this expiration timestamp is used to purge JWT issuance log rows from
   * db, in practice this discrepancy doesn't have any real impact but is noted
   * here for reference.
   */
  @Column('timestamp')
  exp: Date;

  /**
   * Creation timestamp. This is the creation timestamp of the actual issuance
   * log (i.e. this entity), which may be slightly different from the `iat`
   * timestamp included in the JWT itself.
   */
  @Column('timestamp', { name: 'created_at' })
  createdAt: Date;
}
