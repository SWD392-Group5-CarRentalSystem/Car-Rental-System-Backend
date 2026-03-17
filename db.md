# Database Schema Notes

## Tong quan

Du an dang dung MongoDB voi Mongoose, nen "table" tuong ung voi collection.
Cac collection duoc tao tu model trong cac file model.

## Danh sach collections (tables)

### 1) users (model: User)

Source: src/modules/user/models/user.model.ts

Fields:

- \_id: ObjectId
- username: string (required)
- email: string (required, unique)
- phoneNumber: string (required, unique)
- password: string (required)
- role: enum(manager, staff, driver, customer), default customer
- DOB: Date (required)
- avatar: string (optional)
- is_active: boolean, default true
- createdAt: Date (auto)
- updatedAt: Date (auto)

### 2) staffs (model: Staff)

Source: src/modules/user/models/user.model.ts

Fields:

- \_id: ObjectId
- username: string (required)
- email: string (required, unique)
- phoneNumber: string (required, unique)
- password: string (required)
- role: string, default staff
- DOB: Date (required)
- avatar: string (optional)
- is_active: boolean, default true
- createdAt: Date (auto)
- updatedAt: Date (auto)

### 3) drivers (model: Driver)

Source: src/modules/user/models/user.model.ts

Fields:

- \_id: ObjectId
- username: string (required)
- email: string (required, unique)
- phoneNumber: string (required, unique)
- password: string (required)
- role: string, default driver
- DOB: Date (required)
- avatar: string (optional)
- is_active: boolean, default true
- licenseNumber: number (required)
- Rating: number, default 0
- createdAt: Date (auto)
- updatedAt: Date (auto)

### 4) customers (model: Customer)

Source: src/modules/user/models/user.model.ts

Fields:

- Hien tai schema de trong (khong khai bao field rieng)
- createdAt: Date (auto)
- updatedAt: Date (auto)

Ghi chu:

- Kieu ICustomer extends IUser, nhung schema Customer hien tai khong map cac field IUser.

### 5) managers (model: Manager)

Source: src/modules/user/models/user.model.ts

Fields:

- Hien tai schema de trong (khong khai bao field rieng)
- createdAt: Date (auto)
- updatedAt: Date (auto)

Ghi chu:

- Kieu IManager extends IUser, nhung schema Manager hien tai khong map cac field IUser.

### 6) vehicles (model: Vehicle)

Source: src/modules/vehicle/models/vehicle.model.ts

Fields:

- \_id: ObjectId
- vehicleName: string (required)
- vehicleType: string (required)
- vehicleStatus: boolean (required)
- price: number (required, default 0)
- vehicleDetail: object (required)
  - vehicleBrands: string (required)
  - vehicleColor: string (required)
  - vehicleLicensePlate: string (required)
  - vehicleYear: number (required)
  - vehicleSeatCount: number (required)
  - vehicleImage: string (required)
- createdAt: Date (auto)
- updatedAt: Date (auto)

### 7) bookings (model: Booking)

Source: src/modules/booking/models/booking.model.ts

Fields:

- \_id: ObjectId
- customerId: ObjectId (ref User, required)
- vehicleId: ObjectId (ref Vehicle, required)
- driverId: ObjectId (ref Driver, optional)
- rentalType: enum(with_driver, self_drive), required
- startDate: Date (required)
- endDate: Date (required)
- actualReturnDate: Date (optional)
- pickupLocation: string (required)
- dropoffLocation: string (required)
- status: enum(pending, awaiting_deposit_confirmation, confirmed, vehicle_delivered, in_progress, vehicle_returned, completed, cancelled, deposit_lost), default pending
- totalAmount: string (required)
- depositAmount: string (required)
- depositStatus: enum(not_paid, pending_confirmation, confirmed, refunded, lost), default not_paid
- depositTransferredAt: Date (optional)
- depositConfirmedAt: Date (optional)
- driverStatus: enum(pending_driver, accepted, rejected), optional
- driverRespondedAt: Date (optional)
- driverRejectReason: string (optional)
- vehicleReceivedBy: enum(driver, customer), optional
- contractFileUrl: string (optional)
- contractFileName: string (optional)
- contractUploadedAt: Date (optional)
- createdAt: Date (auto)
- updatedAt: Date (auto)

## Quan he chinh

- Booking.customerId -> User.\_id
- Booking.vehicleId -> Vehicle.\_id
- Booking.driverId -> Driver.\_id

## Type files lien quan

- src/types/user.type.ts
- src/types/vehicle.type.ts
- src/types/booking.type.ts
