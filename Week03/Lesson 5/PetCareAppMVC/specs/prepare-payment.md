# Feature: Prepare payment details

## 1. User goal
- A pet owner using the PetCareApp wants to choose a pet service (for example, grooming) and see the service name and the amount to pay before paying.
- The goal is to review the selected service and amount before payment. Preparing payment details is NOT processing a payment.

## 2. Scope
The feature WILL:
- Let a client request payment details for one service, identified by its service ID.
- Look up the service in a fixed mock service catalogue (Section 4).
- Return the payment details as JSON, with the price taken from the catalogue (the server chooses the price).
- Return an error when the service ID is not in the catalogue.

The feature will NOT:
- Charge money or process any payment.
- Connect to a payment gateway (e.g. Stripe or PayPal).
- Create new database tables or change the existing `pets`/`users` tables.
- Add new EJS pages or change existing pages.
- Require login. This classroom mock endpoint is open, unlike `/pets` routes which use `isLoggedIn`.
- Accept a payment amount from the client.

## 3. Request
- Method: `GET`
- URL: `/payments/prepare/:serviceId`
- Input: `serviceId`, the ID of the service, given as a path parameter (e.g. `/payments/prepare/1`).
- No request body, query string or form input is needed.
- The client does not send a price or amount as part of the defined request inputs. If an amount is supplied by the client, it is ignored and does not determine the returned amount. The specification does not define where a client-supplied amount could be supplied; see Section 8.

## 4. Service catalogue
The mock catalogue is the single source of truth for services and prices.

| ID (number) | Service name (string) | Price (number) |
| --- | --- | --- |
| 1 | Vaccination | 35 |
| 2 | Pet Grooming | 50 |
| 3 | Boarding | 80 |

- Prices are in SGD.
- No other services exist for this lesson.

## 5. Successful response
When `serviceId` matches a service in the catalogue:
- HTTP status: `200 OK`
- Body: JSON with exactly these five fields, and no others:

| Field | Type | Value |
| --- | --- | --- |
| `serviceId` | number | The service's ID from the catalogue (e.g. `1`, not `"1"`) |
| `serviceName` | string | The service's name from the catalogue |
| `amount` | number | The service's price from the catalogue (e.g. `35`, not `"35.00"`). Whether this represents whole SGD or cents is unresolved; see Section 8. |
| `currency` | string | Always exactly `"sgd"` (lowercase) |
| `status` | string | Always exactly `"READY_FOR_PAYMENT"` |

Example for `GET /payments/prepare/1`:
```json
{
  "serviceId": 1,
  "serviceName": "Vaccination",
  "amount": 35,
  "currency": "sgd",
  "status": "READY_FOR_PAYMENT"
}
```

## 6. Unsuccessful response
When `serviceId` does not match any service in the catalogue (e.g. `999`):
- HTTP status: `404 Not Found`
- Body: exactly this JSON:
```json
{ "error": "Service not found" }
```
- No payment details are returned.

## 7. Acceptance criteria
- AC1: Given `GET /payments/prepare/1`, the response is `200` with `serviceId` 1, `serviceName` "Vaccination" and `amount` 35.
- AC2: Given `GET /payments/prepare/2`, the response is `200` with `serviceId` 2, `serviceName` "Pet Grooming" and `amount` 50.
- AC3: Given `GET /payments/prepare/3`, the response is `200` with `serviceId` 3, `serviceName` "Boarding" and `amount` 80.
- AC4: Given `GET /payments/prepare/999`, the response is `404` with body exactly `{"error":"Service not found"}`.
- AC5: For each catalogue service ID (1, 2 and 3), the successful response has exactly 5 fields. `serviceId` and `amount` are numbers; `serviceName`, `currency` and `status` are strings; `currency` is `"sgd"` and `status` is `"READY_FOR_PAYMENT"`.

## 8. Open questions
- Malformed and out-of-catalogue IDs: Does the `404` rule in Section 6 apply to `/payments/prepare/abc`, `/payments/prepare/1.5`, `/payments/prepare/0` and `/payments/prepare/-1`, or should any of these return `400`? If `400` is intended, what should its response body be? Not yet agreed.
- Access: login is not required for this classroom mock. Should it require `isLoggedIn` in a later version, like the `/pets` routes?
- Pet link: should the request also include which pet the service is for (e.g. a `petId`)? Not included in this lesson's scope.
- Client-supplied amount: The request section says a supplied amount is ignored, but does not define where it could be supplied. Is that behavior intended for a body, query string, or another input, or should the specification only state that the server uses the catalogue price?
- Amount unit: In this response, does `amount: 35` mean 35 SGD or 35 cents? Not yet agreed.
- Other failures: Are failures beyond an unknown service ID (for example, request or server failures) part of this feature's specification? If so, their status codes and response bodies are not yet defined.
