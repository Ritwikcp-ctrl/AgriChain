```js
                


                                       +----------------------+
                                       |   Web / Mobile Apps  |
                                       |----------------------|
                                       | Farmer              |
                                       | Buyer               |
                                       | Cold Storage Owner  |
                                       | Logistics Provider  |
                                       | Admin               |
                                       +----------+----------+
                                                  |
                                           HTTPS / WebSocket
                                                  |
                                    +-------------v-------------+
                                    |        API Gateway        |
                                    +-------------+-------------+
                                                  |
        -------------------------------------------------------------------------
        |          |            |            |          |          |             |
        |          |            |            |          |          |             |
        v          v            v            v          v          v             v
 +-------------+ +-----------+ +-----------+ +---------+ +---------+ +-------------+
 | Auth Service| |UserService| |CropService| |OrderSvc | |BidSvc   | |Notification |
 +-------------+ +-----------+ +-----------+ +---------+ +---------+ +-------------+
        |               |             |             |           |            |
        ----------------------------------------------------------------------
                                     |
                                     |
                          +----------v-----------+
                          | Matching Service     |
                          |----------------------|
                          | Buyers              |
                          | Cold Storages       |
                          | Logistics           |
                          +----------+----------+
                                     |
            ----------------------------------------------------
            |                        |                          |
            |                        |                          |
            v                        v                          v
   +----------------+      +------------------+      +-------------------+
   | Cold Storage   |      | Logistics Service|      | Pricing Service   |
   | Service        |      |                  |      |                   |
   +----------------+      +------------------+      +-------------------+
            |                        |                          |
            -----------------------------------------------------
                                     |
                              Event Bus (Kafka)
                                     |
        -------------------------------------------------------------------
        |               |                 |               |                |
        |               |                 |               |                |
        v               v                 v               v                v
 Analytics      Email/SMS       Push Notifications    Fraud        Recommendation

 ```




 ```js

                               
                            Users
                              │
                Farmer | Buyer | Logistics
                              │
                     Mobile / Web App
                              │
                        API Gateway
                              │
        ------------------------------------------------
        │                Backend Services               │
        │                                               │
        │ Crop Service      Order Service               │
        │ User Service      Logistics Service           │
        │ Bid Service       Notification Service        │
        ------------------------------------------------
                              │
               ┌──────────────┴──────────────┐
               │                             │
               ▼                             ▼
        PostgreSQL / MongoDB         Blockchain Network
        (Fast Application Data)      (Immutable Records)
               │                             │
               └──────────────┬──────────────┘
                              │
                         IPFS / Object Storage
                      (Images, PDFs, Certificates)


```                      