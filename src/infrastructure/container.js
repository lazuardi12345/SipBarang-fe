/**
 * Composition Root Frontend.
 * Menghubungkan use case dan presentation layer ke implementasi API Repository
 * yang berkomunikasi langsung dengan Express.js Backend.
 */
import { ApiUserRepository } from "./repositories/ApiUserRepository";
import { ApiTarifRepository } from "./repositories/ApiTarifRepository";
import { ApiDeliveryOrderRepository } from "./repositories/ApiDeliveryOrderRepository";
import { ApiInvoiceRepository } from "./repositories/ApiInvoiceRepository";

class Container {
  static _userRepo = null;
  static _tarifRepo = null;
  static _doRepo = null;
  static _invoiceRepo = null;

  static get userRepository() {
    if (!this._userRepo) this._userRepo = new ApiUserRepository();
    return this._userRepo;
  }

  static get tarifRepository() {
    if (!this._tarifRepo) this._tarifRepo = new ApiTarifRepository();
    return this._tarifRepo;
  }

  static get deliveryOrderRepository() {
    if (!this._doRepo) this._doRepo = new ApiDeliveryOrderRepository();
    return this._doRepo;
  }

  static get invoiceRepository() {
    if (!this._invoiceRepo) this._invoiceRepo = new ApiInvoiceRepository();
    return this._invoiceRepo;
  }
}

export default Container;
