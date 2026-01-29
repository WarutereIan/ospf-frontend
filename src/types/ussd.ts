/**
 * USSD types
 * Mirrors backend UssdRequestDto (Africa's Talking USSD webhook payload).
 * See: https://developers.africastalking.com/docs/ussd
 */

export interface UssdRequestDto {
  sessionId: string;
  serviceCode: string;
  phoneNumber: string;
  text?: string;
  networkCode?: string;
}
