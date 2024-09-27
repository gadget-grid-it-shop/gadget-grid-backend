export interface TAddress {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
}

export interface TAdminName {
    firstName: string,
    middleName?: string,
    lastName: string,
}


interface TAdmin {
    name: TAdminName,
    email: string,
    address?: TAddress,
    phoneNumber: string,

}