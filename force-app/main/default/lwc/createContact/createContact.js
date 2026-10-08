import { LightningElement, api, track } from 'lwc';
import { createRecord, getRecord } from 'lightning/uiRecordApi';
import ACCOUNT_NAME_FIELD from '@salesforce/schema/Account.Name';
import CONTACT_OBJECT from '@salesforce/schema/Contact';
import FIRSTNAME_FIELD from '@salesforce/schema/Contact.FirstName';
import LASTNAME_FIELD from '@salesforce/schema/Contact.LastName';
import EMAIL_FIELD from '@salesforce/schema/Contact.Email';
import PHONE_FIELD from '@salesforce/schema/Contact.Phone';
import ACCOUNTID_FIELD from '@salesforce/schema/Contact.AccountId';
import ARABIC_FIRST_FIELD from '@salesforce/schema/Contact.Arabic_First_Name__c';
import ARABIC_LAST_FIELD from '@salesforce/schema/Contact.Arabic_Last_Name__c';
import IS_EMIRATES_FIELD from '@salesforce/schema/Contact.Is_Emirates_ID__c';

export default class ContactCreator extends LightningElement {
    @api recordId; // Account Id
    @track isModalOpen = false;

    // form fields
    firstName = '';
    arabicFirstName = '';
    lastName = '';
    arabicLastName = '';
    email = '';
    phone = '';
    accountName = '';
    isEmiratesId = '';

    createdContactId = null;
    errorMessage = null;

    yesNoOptions = [
        { label: 'Yes', value: 'Yes' },
        { label: 'No', value: 'No' }
    ];

    connectedCallback() {
        // prepopulate account name
        if (this.recordId) {
            // fetch account name via getRecord
            getRecord({ recordId: this.recordId, fields: [ACCOUNT_NAME_FIELD] })
                .then(result => {
                    this.accountName = result.fields.Name.value;
                })
                .catch(err => {
                    
                    this.accountName = '';
                });
        }
    }

    openModal() {
        this.isModalOpen = true;
    }

    closeModal() {
        this.isModalOpen = false;
        this.resetForm();
    }

    resetForm() {
        this.firstName = '';
        this.arabicFirstName = '';
        this.lastName = '';
        this.arabicLastName = '';
        this.email = '';
        this.phone = '';
        this.isEmiratesId = '';
        this.createdContactId = null;
        this.errorMessage = null;
    }

    handleChange(event) {
        const field = event.target.dataset.id;
        if (field === 'firstName') this.firstName = event.target.value;
        if (field === 'arabicFirstName') this.arabicFirstName = event.target.value;
        if (field === 'lastName') this.lastName = event.target.value;
        if (field === 'arabicLastName') this.arabicLastName = event.target.value;
        if (field === 'email') this.email = event.target.value;
        if (field === 'phone') this.phone = event.target.value;
    }

    handleEmiratesChange(event) {
        this.isEmiratesId = event.detail.value;
    }

    get showEmiratesUpload() {
        return this.isEmiratesId === 'Yes';
    }

    validateInputs() {
        // required fields
        if (!this.firstName || !this.arabicFirstName || !this.lastName || !this.arabicLastName || !this.email || !this.phone) {
            this.errorMessage = 'Please fill all required fields.';
            return false;
        }

        // email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.email)) {
            this.errorMessage = 'Please enter a valid email address.';
            return false;
        }

        // UAE phone validation
        const uaPhoneRegex = /^(?:\+9715\d{7}|05\d{8})$/;
        if (!uaPhoneRegex.test(this.phone)) {
            this.errorMessage = 'Please enter a valid UAE phone number (e.g. +9715XXXXXXXX ).';
            return false;
        }

        this.errorMessage = null;
        return true;
    }

    saveContact() {
        if (!this.validateInputs()) return;

        const fields = {};
        fields[FIRSTNAME_FIELD.fieldApiName] = this.firstName;
        fields[LASTNAME_FIELD.fieldApiName] = this.lastName;
        fields[EMAIL_FIELD.fieldApiName] = this.email;
        fields[PHONE_FIELD.fieldApiName] = this.phone;
        fields[ACCOUNTID_FIELD.fieldApiName] = this.recordId;
        fields[ARABIC_FIRST_FIELD.fieldApiName] = this.arabicFirstName;
        fields[ARABIC_LAST_FIELD.fieldApiName] = this.arabicLastName;
        fields[IS_EMIRATES_FIELD.fieldApiName] = this.isEmiratesId || 'No';

        const recordInput = { apiName: CONTACT_OBJECT.objectApiName, fields };

        createRecord(recordInput)
            .then(contact => {
                this.createdContactId = contact.id;
                this.errorMessage = null;
            })
            .catch(error => {
                this.errorMessage = 'Error creating contact: ' + (error.body ? error.body.message : error.message);
            });
    }
}
