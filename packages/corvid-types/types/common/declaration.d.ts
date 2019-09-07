/**
 * The wix-location module contains functionality for getting information
 *  about the URL of the current page and for navigating to other pages.
 */
declare module 'wix-location' {
    /**
     * Gets the base URL of the page.
     */
    const baseUrl: string;

    /**
     * Gets the path of the page's URL.
     */
    const path: [string];

    /**
     * Gets the prefix of a dynamic page's or router page's URL.
     */
    const prefix: string;

    /**
     * Gets the protocol of the page's URL.
     */
    const protocol: string;

    /**
     * Gets an object that represents the query segment of the page's URL.
     */
    const query: object;

    /**
     * Gets the full URL of the current page.
     */
    const url: string;

    /**
     * Adds an event handler that runs when an application page's URL changes.
     */
    function onChange(handler: wix_location.LocationChangeHandler): void;

    /**
     * Directs the browser to navigate to the specified URL.
     */
    function to(url: string): void;

}

/**
 * The wix-site module contains functionality for obtaining information about your site and its pages.
 */
declare module 'wix-site' {
    /**
     * Gets a code representing the site's currency.
     */
    const currency: string;

    /**
     * Gets information about the current page or lightbox.
     */
    const currentPage: wix_site.StructurePage;

    /**
     * Gets a code representing the site's language.
     */
    const language: string;

    /**
     * Gets the site's regional settings.
     */
    const regionalSettings: string;

    /**
     * Gets the site revision ID.
     */
    const revision: string;

    /**
     * Gets the site's timezone.
     */
    const timezone: string;

    /**
     * Returns information about the site's pages, prefixes, and lightboxes.
     */
    function getSiteStructure(): wix_site.SiteStructure;

    /**
     * Returns the sitemap for a router or dynamic page prefix.
     */
    function routerSitemap(routerPrefix: string): Promise<[wix_router.WixRouterSitemapEntry]>;

}

/**
 * The wix-storage module contains functionality for the persistent
 *  storage of key/value data in the site visitor's browser.
 */
declare module 'wix-storage' {
    /**
     * Used for local storage of data.
     */
    const local: wix_storage.Storage;

    /**
     * Used for memory storage of data.
     */
    const memory: wix_storage.Storage;

    /**
     * Used for session storage of data.
     */
    const session: wix_storage.Storage;

}

/**
 * The wix-window module contains functionality that pertains to the
 *  current browser window.
 */
declare module 'wix-window' {
    /**
     * Gets the locale of the site visitor's browser.
     */
    const browserLocale: string;

    /**
     * Gets what kind of device is being used to view the page.
     */
    const formFactor: string;

    /**
     * Gets the locale of the current environment.
     */
    const locale: string;

    /**
     * Gets the HTTP referrer header field.
     */
    const referrer: string;

    /**
     * Gets which mode the site is currently being viewed in.
     */
    const viewMode: string;

    /**
     * Returns information about the window.
     */
    function getBoundingRect(): Promise<wix_window.WindowSizeInfo>;

    /**
     * Returns the current geolocation of the user.
     */
    function getCurrentGeolocation(): Promise<object>;

    /**
     * Returns the data that a router passed to the page in its response.
     */
    function getRouterData(): object;

    /**
     * Opens a lightbox and optionally passes it the given data.
     */
    function openLightbox(name: string, data?: object): Promise<object>;

    /**
     * Opens a modal window that displays the specified web page.
     */
    function openModal(url: string, options: wix_window.OpenModalOptions): Promise<void>;

    /**
     * Sends a message to the page's parent.
     */
    function postMessage(message: object, target?: string): Promise<object>;

    /**
     * Scrolls the page by a given number of pixels.
     */
    function scrollBy(x: number, y: number): Promise<void>;

    /**
     * Scrolls the page to a specific location.
     */
    function scrollTo(x: number, y: number, options?: wix_window.ScrollToOptions): Promise<void>;

    /**
     * Sends a tracking event to external analytics tools.
     */
    function trackEvent(eventName: string, parameters: wix_window.trackingParameters.AddPaymentInfoEvent): void;

}

/**
 * HTTP functions are used to expose an API of your site's functionality.
 */
declare module 'wix-http-functions' {
    /**
     * Returns a response with status code 400 (Bad Request) and the information from the options parameter.
     */
    function badRequest(options: wix_http_functions.WixHttpFunctionResponseOptions): wix_http_functions.WixHttpFunctionResponse;

    /**
     * Returns a response with status code 201 (Created) and the information from the options parameter.
     */
    function created(options: wix_http_functions.WixHttpFunctionResponseOptions): wix_http_functions.WixHttpFunctionResponse;

    /**
     * A function that responds to requests made with the HTTP DELETE method.
     */
    /* Illegal function name 'delete' can't be used here
    function delete(request: wix_http_functions.WixHttpFunctionRequest): wix_http_functions.WixHttpFunctionResponse;
    */

    /**
     * Returns a response with status code 403 (Forbidden) and the information from the options parameter.
     */
    function forbidden(options: wix_http_functions.WixHttpFunctionResponseOptions): wix_http_functions.WixHttpFunctionResponse;

    /**
     * A function that responds to requests made with the HTTP GET method.
     */
    function get(request: wix_http_functions.WixHttpFunctionRequest): wix_http_functions.WixHttpFunctionResponse;

    /**
     * Returns a response with status code 404 (Not Found) and the information from the options parameter.
     */
    function notFound(options: wix_http_functions.WixHttpFunctionResponseOptions): wix_http_functions.WixHttpFunctionResponse;

    /**
     * Returns a response with status code 200 (OK) and the information from the options parameter.
     */
    function ok(options: wix_http_functions.WixHttpFunctionResponseOptions): wix_http_functions.WixHttpFunctionResponse;

    /**
     * A function that responds to requests made with the HTTP OPTIONS method.
     */
    function options(request: wix_http_functions.WixHttpFunctionRequest): wix_http_functions.WixHttpFunctionResponse;

    /**
     * A function that responds to requests made with the HTTP POST method.
     */
    function post(request: wix_http_functions.WixHttpFunctionRequest): wix_http_functions.WixHttpFunctionResponse;

    /**
     * A function that responds to requests made with the HTTP PUT method.
     */
    function put(request: wix_http_functions.WixHttpFunctionRequest): wix_http_functions.WixHttpFunctionResponse;

    /**
     * Returns a response populated with the information from the options parameter.
     *  The `response()` function creates a custom response built with the
     *  information passed to the `options` parameter in a [`WixHttpFunctionResponseOptions`](#WixHttpFunctionResponseOptions)
     *  object.
     * 
     *  Use the `response()` function to create a response to return from an HTTP
     *  function.
     */
    function response(options: wix_http_functions.WixHttpFunctionResponseOptions): wix_http_functions.WixHttpFunctionResponse;

    /**
     * Returns a response with status code 500 (Internal Server Error) and the information from the options parameter.
     */
    function serverError(options: wix_http_functions.WixHttpFunctionResponseOptions): wix_http_functions.WixHttpFunctionResponse;

    /**
     * A function that responds to requests made with any HTTP method.
     */
    function use(request: wix_http_functions.WixHttpFunctionRequest): wix_http_functions.WixHttpFunctionResponse;

}

/**
 * The wix-crm-backend module contains functionality for working with
 *  [your site's contacts](https://support.wix.com/en/article/about-your-contact-list)
 *  from backend code.
 */
declare module 'wix-crm-backend' {
    /**
     * Creates a new contact or updates an existing contact.
     */
    function createContact(contactInfo: wix_crm_backend.ContactInfo): Promise<string>;

    /**
     * Sends a Triggered Email to a contact.
     */
    function emailContact(emailId: string, toContact: string, options?: wix_users.TriggeredEmailOptions): Promise<void>;

    /**
     * Gets an existing contact by ID.
     */
    function getContactById(contactId: string): Promise<wix_crm_backend.ContactInfo>;

    /**
     * Updates an existing contact.
     */
    function updateContact(contactId: string, contactInfo: wix_crm_backend.ContactInfo): Promise<void>;

}

/**
 * The wix-data module contains functionality for working with data in collections.
 */
declare module 'wix-data' {
    /**
     * Creates an aggregation.
     */
    function aggregate(collectionName: string): wix_data.WixDataAggregate;

    /**
     * Adds a number of items to a collection.
     */
    function bulkInsert(collectionName: string, items: [object], options?: wix_data.WixDataOptions): Promise<wix_data.WixDataBulkResult>;

    /**
     * Inserts or updates a number of items in a collection.
     */
    function bulkSave(collectionName: string, items: [object], options?: wix_data.WixDataOptions): Promise<wix_data.WixDataBulkResult>;

    /**
     * Updates a number of items in a collection.
     */
    function bulkUpdate(collectionName: string, items: [object], options?: wix_data.WixDataOptions): Promise<wix_data.WixDataBulkResult>;

    /**
     * Creates a filter to be used with the dataset `setFilter()` function.
     */
    function filter(): wix_data.WixDataFilter;

    /**
     * Retrieves an item from a collection.
     */
    function get(collectionName: string, itemId: string, options?: wix_data.WixDataOptions): Promise<object>;

    /**
     * Adds an item to a collection.
     */
    function insert(collectionName: string, item: object, options?: wix_data.WixDataOptions): Promise<object>;

    /**
     * Inserts a reference in the specified property.
     */
    function insertReference(collectionName: string, propertyName: string, referringItem: object, referencedItem: object, options?: wix_data.WixDataOptions): Promise<void>;

    /**
     * Checks if a reference to the referenced item exists in the specified
     *   property of the referring item.
     */
    function isReferenced(collectionName: string, propertyName: string, referringItem: object, referencedItem: object): Promise<boolean>;

    /**
     * Creates a query.
     */
    function query(collectionName: string): wix_data.WixDataQuery;

    /**
     * Gets the full items referenced in the specified property.
     */
    function queryReferenced(collectionName: string, item: object, propertyName: string, options: wix_data.WixDataQueryReferencedOptions): Promise<wix_data.WixDataQueryReferencedResult>;

    /**
     * Removes an item from a collection.
     */
    function remove(collectionName: string, itemId: string, options?: wix_data.WixDataOptions): Promise<object>;

    /**
     * Removes a reference from the specified property.
     */
    function removeReference(collectionName: string, propertyName: string, referringItem: object, referencedItem: object, options?: wix_data.WixDataOptions): Promise<void>;

    /**
     * Replaces current references with references in the specified property.
     */
    function replaceReferences(collectionName: string, propertyName: string, referringItem: object, referencedItem: object, options?: wix_data.WixDataOptions): Promise<void>;

    /**
     * Inserts or updates an item in a collection.
     */
    function save(collectionName: string, item: object, options?: wix_data.WixDataOptions): Promise<object>;

    /**
     * Creates a sort to be used with the dataset `setSort()` function.
     */
    function sort(): wix_data.WixDataSort;

    /**
     * Updates an item in a collection.
     */
    function update(collectionName: string, item: object, options?: wix_data.WixDataOptions): Promise<object>;

}

/**
 * An implementation of the standard [Javascript Fetch API](https://developer.mozilla.org/en/docs/Web/API/Fetch_API)
 *  which can be used in public and backend code for fetching resources
 *  from [3rd party services](https://support.wix.com/en/article/accessing-3rd-party-services)
 *  using HTTPS.
 */
declare module 'wix-fetch' {
    /**
     * Retrieves the specified resource from the network using HTTPS.
     */
    function fetch(url: string, options: wix_fetch.WixFetchRequest): Promise<wix_fetch.WixFetchResponse>;

    /**
     * Retrieves the specified JSON resource from the network using HTTPS.
     */
    function getJSON(url: string, options: wix_fetch.WixFetchRequest): Promise<object>;

}

/**
 * The wix-pay-backend module contains functionality for working with
 *  payments from backend code.
 */
declare module 'wix-pay-backend' {
    /**
     * Creates a new payment.
     */
    function createPayment(paymentInfo: wix_pay_backend.PaymentInfo): Promise<wix_pay.Payment>;

}

/**
 * This module contains the APIs for code routers and data binding router hooks.
 */
declare module 'wix-router' {
    /**
     * Registers a hook that is called after a router.
     */
    function afterRouter(request: wix_router.WixRouterRequest, response: wix_router.WixRouterResponse): Promise<wix_router.WixRouterResponse>;

    /**
     * Registers a hook that is called after a sitemap is created.
     */
    function afterSitemap(request: wix_router.WixRouterSitemapRequest, sitemapEntries: [wix_router.WixRouterSitemapEntry]): Promise<[wix_router.WixRouterSitemapEntry]>;

    /**
     * Registers a hook that is called before a router.
     */
    function beforeRouter(request: wix_router.WixRouterRequest): Promise<wix_router.WixRouterResponse>;

    /**
     * Registers a hook that is called after a route is resolved by the data binding router, but before the wix-data query is executed.
     */
    function customizeQuery(request: wix_router.WixRouterRequest, route: string, query: wix_data.WixDataQuery): wix_data.WixDataQuery;

    /**
     * Returns a response with a status code 403 (Forbidden) and instructs the router to show a 403 page.
     */
    function forbidden(message?: string): Promise<wix_router.WixRouterResponse>;

    /**
     * Returns a response that instructs the router to continue.
     */
    function next(): Promise<wix_router.WixRouterResponse>;

    /**
     * Returns a response with a status code 404 (Not Found) and instructs the router to show a 404 page.
     */
    function notFound(message?: string): Promise<wix_router.WixRouterResponse>;

    /**
     * Returns a response with a status code 200 (OK) and instructs the router to show the selected page.
     */
    function ok(Page: string, routerReturnedData?: object, head?: wix_router.WixRouterResponse.HeadOptions): Promise<wix_router.WixRouterResponse>;

    /**
     * Returns a response with a status code of 301 (Moved Permanently) or 302 (Found) and instructs the router to redirect to the given URL.
     */
    function redirect(url: string, statusCode?: string): Promise<wix_router.WixRouterResponse>;

    /**
     * Function containing routing logic for a given URL prefix.
     */
    function router(request: wix_router.WixRouterRequest): Promise<wix_router.WixRouterResponse>;

    /**
     * Returns a response with the specified HTTP status code with an optional message.
     */
    function sendStatus(statusCode: string, message?: string): Promise<wix_router.WixRouterResponse>;

    /**
     * Function containing sitemap logic for a given URL prefix.
     */
    function sitemap(request: wix_router.WixRouterSitemapRequest): Promise<[wix_router.WixRouterSitemapEntry]>;

}

/**
 * The wix-stores-backend module contains functionality for working with your
 *  site's store from backend code.
 */
declare module 'wix-stores-backend' {
    /**
     * Gets the current site visitor's shopping cart.
     */
    function getCurrentCart(): Promise<wix_stores_backend.Cart>;

    /**
     * Gets the availability of a product based on the specified option choices.
     */
    function getProductOptionsAvailability(productId: string, choices: wix_stores_backend.StoreProductChoices): Promise<wix_stores_backend.ProductOptionsAvailability>;

}

/**
 * The wix-users-backend module contains functionality for working with your
 *  site's users from backend code.
 */
declare module 'wix-users-backend' {
    /**
     * Gets the current user viewing the site.
     */
    const currentUser: wix_users.User;

    /**
     * Approve a member whose status is `"Pending"` using an email address.
     */
    function approveByEmail(email: string): Promise<string>;

    /**
     * Approve a member whose status is `"Pending"` using an approval token.
     */
    function approveByToken(token: string): Promise<string>;

    /**
     * Blocks a member from logging into the site.
     */
    function blockByEmail(email: string): Promise<void>;

    /**
     * Sends a Triggered Email to the specified site member.
     */
    function emailUser(emailId: string, toUser: string, options?: wix_users.TriggeredEmailOptions): Promise<void>;

    /**
     * Create a session token for a member authenticated by a 3rd party.
     */
    function generateSessionToken(email: string): Promise<string>;

    /**
     * Logs a user in based on email and password.
     */
    function login(email: string, password: string): Promise<string>;

    /**
     * Registers a new site member.
     */
    function register(email: string, password: string, options?: wix_users.RegistrationOptions): Promise<wix_users_backend.RegistrationResult>;

}

/**
 * The wix-bookings module contains functionality for working with
 *  bookings from client-side code.
 */
declare module 'wix-bookings' {
    /**
     * Books a service and processes payment for the service.
     */
    function checkoutBooking(bookingInfo: wix_bookings.BookingInfo, options?: wix_bookings.PaymentOptions): Promise<wix_bookings.BookingResult>;

    /**
     * Gets the available slots for a specific service.
     */
    function getServiceAvailability(serviceId: string, options?: wix_bookings.AvailabilityOptions): Promise<wix_bookings.ServiceAvailability>;

}

/**
 * The wix-crm module contains functionality for working with
 *  [your site's contacts](https://support.wix.com/en/article/about-your-contact-list)
 *  from client-side code.
 */
declare module 'wix-crm' {
    /**
     * Creates a new contact or updates an existing contact.
     */
    function createContact(contactInfo: wix_crm.ContactInfo): Promise<string>;

    /**
     * Sends a Triggered Email to the contact.
     */
    function emailContact(emailId: string, toContact: string, options?: wix_users.TriggeredEmailOptions): Promise<void>;

}

/**
 * The wix-paid-plans module contains functionality for working with
 *  paid plans from client-side code.
 */
declare module 'wix-paid-plans' {
    /**
     * Orders a paid plan.
     */
    function orderPlan(planId: string): Promise<wix_paid_plans.OrderResult>;

    /**
     * Orders and purchases a paid plan.
     */
    function purchasePlan(planId: string): Promise<wix_paid_plans.PurchaseResult>;

}

/**
 * The wix-pay module contains functionality for working with
 *  payments from client-side code.
 */
declare module 'wix-pay' {
    /**
     * Starts a payment.
     */
    function startPayment(paymentId: string, options?: wix_pay.PaymentOptions): Promise<wix_pay.PaymentResult>;

}

/**
 * The wix-stores module contains functionality for working with your
 *  site's store from from client-side code.
 */
declare module 'wix-stores' {
    /**
     * Gets the availability of a product based on the specified option choices.
     */
    function getProductOptionsAvailability(productId: string, choices: wix_stores_backend.StoreProductChoices): Promise<wix_stores_backend.ProductOptionsAvailability>;

}

/**
 * The wix-users module contains functionality for working with your
 *  site's users from client-side code.
 */
declare module 'wix-users' {
    /**
     * Gets the current user viewing the site.
     */
    const currentUser: wix_users.User;

    /**
     * Logs the current user into the site using the given session token.
     */
    function applySessionToken(sessionToken: string): Promise<void>;

    /**
     * Sends a Triggered Email to the currently logged-in site member.
     */
    function emailUser(emailId: string, toUser: string, options?: wix_users.TriggeredEmailOptions): Promise<void>;

    /**
     * Logs a user in based on email and password.
     */
    function login(email: string, password: string): Promise<void>;

    /**
     * Logs the current user out of the site.
     */
    function logout(): void;

    /**
     * Sets the function that runs when a user logs in.
     */
    function onLogin(handler: wix_users.LoginHandler): void;

    /**
     * Prompts the current site visitor with a password reset.
     */
    function promptForgotPassword(language?: string): Promise<void>;

    /**
     * Prompts the current site visitor to log in as a site member.
     */
    function promptLogin(options: wix_users.LoginOptions): Promise<wix_users.User>;

    /**
     * Registers a new site member.
     */
    function register(email: string, password: string, options?: wix_users.RegistrationOptions): Promise<wix_users.RegistrationResult>;

}

declare namespace $w {
    /**
    * Selects and returns elements from a page.
    */
   type $w = (selector: string) => $w.Element;

    /**
     * A post page for a specific blog post.
     */
    interface PostPage extends $w.Element, $w.HiddenCollapsedMixin{
        /**
         * Gets the all the information associated with the current blog post.
         */
        getPost(): Promise<$w.PostPage.BlogPost>;
    }

    namespace PostPage {
        /**
         * An object representing a blog post on a post page.
         */
        type BlogPost = {
            /**
             * Post ID.
             */
            _id: string;
            /**
             * Post title.
             */
            title: string;
            /**
             * Text of the post.
             */
            plainContent: string;
            /**
             * Date the post was originally published.
             */
            publishedDate: Date;
            /**
             * Number of times the post was viewed.
             */
            viewCount: number;
            /**
             * Number of likes the post received.
             */
            likeCount: number;
            /**
             * Number of comments the post received.
             */
            commentCount: number;
            /**
             * Date the post was most recently published.
             */
            lastPublishedDate: Date;
            /**
             * Indicates whether the cover image is displayed in the post.
             */
            coverImageDisplayed: boolean;
            /**
             * Estimated time in minutes required to read the post.
             */
            timeToRead: number;
            /**
             * Indicates whether the post was pinned to the top of the blog feed.
             */
            pinned: boolean;
            /**
             * Indicates whether the post is set as featured in the post settings. Featured posts appear in custom blog feeds.
             */
            featured: boolean;
            /**
             * List of all hashtags in the post.
             */
            hashtags: [string];
            /**
             * The post's cover [image]($w.Image.html#src).
             */
            coverImage: string;
            /**
             * Relative URL of the post page on your published site.
             */
            postPageUrl: string;
            /**
             * A few lines of text that appear in the blog feed. Defined in Post Settings or default of first 160 characters of the post.
             */
            excerpt: string;
        };

    }

    /**
     * Anchors
     *  are invisible position markers which you can place anywhere on your site.
     *  They are a useful way to direct users to important sections.
     */
    interface Anchor extends $w.Node, $w.ViewportMixin{
        /**
         * Gets the name of an anchor.
         */
        readonly name: string;
    }

    /**
     * Provides functionality for background images in certain elements.
     */
    interface Background {
        /**
         * Gets an object containing information about the element's background.
         */
        readonly background: $w.Background.BackgroundOptions;
    }

    namespace Background {
        /**
         * An object used by the `background` property that contains the background options.
         */
        type BackgroundOptions = {
            /**
             * The file location of the background image or video.
             */
            src: string;
        };

    }

    /**
     * Container boxes
     *  are used to structure your site. You can attach
     *  any element to a container box and move the box around, which is a useful
     *  way to to keep elements together. Some actions performed on a box affect the
     *  elements it contains. For example, [hiding](#hide) a box also effectively
     *  hides all the elements in the box, although the values of the
     *  [hidden](#hidden) properties of the elements contained in the box do not change.
     */
    interface Box extends $w.Element, $w.HiddenCollapsedMixin, $w.ClickableMixin, $w.ContainableMixin, $w.StyleMixin{
        /**
         * Gets an object containing information about the box's styles.
         */
        readonly style: $w.Style;
    }

    /**
     * A text button or an icon button.
     */
    interface Button extends $w.Element, $w.HiddenCollapsedMixin, $w.DisabledMixin, $w.LinkableMixin, $w.ClickableMixin, $w.StyleMixin, $w.LabelMixin{
        /**
         * Sets or gets the label of a text button.
         */
        label: string;
        /**
         * Gets an object containing information about the button's styles.
         */
        readonly style: $w.Style;
    }

    /**
     * Checkboxes are used for a single binary choice.
     */
    interface Checkbox extends $w.FormElement, $w.DisabledMixin, $w.HiddenCollapsedMixin, $w.FocusMixin, $w.ClickableMixin, $w.StyleMixin, $w.RequiredMixin, $w.CheckedMixin{
        /**
         * Sets or gets whether a checkbox is checked.
         */
        checked: boolean;
        /**
         * Determines if a checkbox is required to be checked.
         */
        required: boolean;
        /**
         * Gets an object containing information about the checkbox's styles.
         */
        readonly style: $w.Style;
        /**
         * Sets or gets a checkbox's value.
         */
        value: string;
    }

    /**
     * Checkbox groups are used for selecting any number of the given
     *  options. Checkbox groups consist of a list of [options](#Option). Each
     *  [option](#Option) contains a label, which is what the user sees, and a
     *  value, which is what is used in code and stored in you collections.
     */
    interface CheckboxGroup extends $w.FormElement, $w.HiddenCollapsedMixin, $w.DisabledMixin, $w.FocusMixin, $w.ClickableMixin, $w.StyleMixin, $w.RequiredMixin{
        /**
         * Sets or gets the options of a checkbox group.
         */
        options: [$w.CheckboxGroup.Option];
        /**
         * Sets or gets the indices of the selected options.
         */
        selectedIndices: [number];
        /**
         * Gets an object containing information about the checkbox group's styles.
         */
        readonly style: $w.Style;
        /**
         * Sets or gets the value of the selected options.
         */
        value: [string];
    }

    namespace CheckboxGroup {
        /**
         * An object used by the `options` property that contains the attributes of checkbox item.
         */
        type Option = {
            /**
             * The value of the checkbox option. This is what you use in code and is what is stored in your collections.
             */
            value: string;
            /**
             * The label of the checkbox option. This is what a user sees.
             */
            label?: string;
        };

    }

    interface CheckedMixin {
        /**
         * Sets or gets whether the element is checked or not.
         */
        checked: boolean;
    }

    interface ClickableMixin {
        /**
         * Adds an event handler that runs when the element is clicked.
         */
        onClick(handler: $w.MouseEventHandler): $w.Element;
        /**
         * Adds an event handler that runs when the element is double-clicked.
         */
        onDblClick(handler: $w.MouseEventHandler): $w.Element;
    }

    /**
     * Provides functionality for elements that can be collapsed.
     * 
     *  To learn about the behavior of a collapsed element,
     *  see the [`collapsed`](#collapsed) property.
     */
    interface CollapsedMixin {
        /**
         * Indicates if the element is collapsed or expanded.
         */
        readonly collapsed: boolean;
        /**
         * Collapses the element and sets its `collapsed` property to `true`.
         */
        collapse(): Promise<void>;
        /**
         * Expands the element and sets its `collapsed` property to `false`.
         */
        expand(): Promise<void>;
    }

    /**
     * A `Column` is a component part of a `ColumnStrip`.
     */
    interface Column extends $w.Element, $w.HiddenCollapsedMixin, $w.Background, $w.ClickableMixin, $w.ContainableMixin{
    }

    /**
     * A `ColumnStrip` is a strip of `Column` elements.
     */
    interface ColumnStrip extends $w.Element, $w.Background, $w.HiddenCollapsedMixin, $w.ClickableMixin, $w.ContainableMixin{
        /**
         * Gets an object containing information about the column strip's background, such as its image or video source.
         */
        readonly background: $w.Document.BackgroundOptions;
        /**
         * Gets a list of all the columns contained in the column strip.
         */
        readonly columns: [$w.Column];
    }

    /**
     * Provides functionality for elements that can contain other elements.
     *  Some elements, such as pages, headers, footers, and boxes, can contain
     *  other elements. This occurs when you drag an element onto a container
     *  element and attach it.
     *  These attached elements are considered the parent element's children. Some
     *  actions performed on the parent, such as [`hiding`]($w.HiddenMixin.html#hide),
     *  affect the element's children as well.
     */
    interface ContainableMixin {
        /**
         * Gets an array of the elements that are contained within the element.
         */
        readonly children: [$w.Element];
    }

    /**
     * A container for Repeater items.
     */
    interface Container extends $w.Element, $w.HiddenCollapsedMixin, $w.Background, $w.ClickableMixin, $w.ContainableMixin{
    }

    /**
     * A `DatePicker` is used for entering dates. It lets users populate a
     *  date field by picking a date using a calendar popup.
     */
    interface DatePicker extends $w.FormElement, $w.HiddenCollapsedMixin, $w.DisabledMixin, $w.FocusMixin, $w.ReadOnlyMixin, $w.ClickableMixin, $w.RequiredMixin{
        /**
         * Sets or gets the dates that a user cannot select.
         */
        disabledDates: [Date];
        /**
         * Sets or gets the days of the week that a user cannot select.
         */
        disabledDaysOfWeek: [number];
        /**
         * Sets or gets the latest date that a user can select.
         */
        maxDate: Date;
        /**
         * Sets or gets the earliest date that a user can select.
         */
        minDate: Date;
        /**
         * Sets or gets the value of the date picker.
         */
        value: Date;
    }

    interface DisabledMixin {
        /**
         * Indicates if the element is enabled or disabled.
         */
        readonly enabled: boolean;
        /**
         * Disables the element and sets its `enabled` property to `false`.
         */
        disable(): Promise<void>;
        /**
         * Enables the element and sets its `enabled` property to `true`.
         */
        enable(): Promise<void>;
    }

    /**
     * A complete web page, which consists of a Header, Page, and Footer.
     */
    interface Document {
        /**
         * Gets an object containing information about the document's background, such as its image or video source.
         */
        readonly background: $w.Document.BackgroundOptions;
        /**
         * Gets the document's Header, Page, and Footer.
         */
        readonly children: [$w.Node];
        /**
         * Gets the document's type.
         */
        readonly type: string;
    }

    namespace Document {
        /**
         * An object used by the `background` property that contains the background options.
         */
        type BackgroundOptions = {
            /**
             * The file location of the background image.
             */
            src: string;
        };

    }

    /**
     * Dropdowns are used for selecting one of a number of options.
     *  They are especially useful when there are too many options to display using
     *  [radio buttons]($w.RadioButtonGroup.html). Dropdowns consist of a list
     *  of [options](#Option). Each [option](#Option) contains a label, which is
     *  what the user sees, and a value, which is what is used in code and stored in
     *  you collections.
     */
    interface Dropdown extends $w.FormElement, $w.HiddenCollapsedMixin, $w.DisabledMixin, $w.FocusMixin, $w.ClickableMixin, $w.StyleMixin, $w.RequiredMixin{
        /**
         * Sets or gets the options in a dropdown.
         */
        options: [$w.Dropdown.Option];
        /**
         * Sets or gets the dropdown's placeholder text.
         */
        placeholder: string;
        /**
         * Sets or gets the index of the selected option.
         */
        selectedIndex: number;
        /**
         * Gets an object containing information about the dropdown's styles.
         */
        readonly style: $w.Style;
        /**
         * Sets or gets an element's value.
         */
        value: string;
    }

    namespace Dropdown {
        /**
         * An object used by the `options` property that contains the attributes of a dropdown list item.
         */
        type Option = {
            /**
             * The value of the dropdown option. This is what you use in code and is what is stored in your collections.
             */
            value: string;
            /**
             * The label of the dropdown option. This is what a user sees.
             */
            label?: string;
        };

    }

    /**
     * The Rendering API is used to control when code is run as a page is being loaded.
     */
    interface EffectOptions {
    }

    namespace EffectOptions {
        /**
         * An object used to customize the `"arc"` effect.
         */
        type ArcEffectOptions = {
            duration: number;
            delay: number;
            direction: string;
        };

        /**
         * An object used to customize the `"bounce"` effect.
         */
        type BounceEffectOptions = {
            duration: number;
            delay: number;
            direction: string;
            intensity: string;
        };

        /**
         * An object used to customize the `"fade"` effect.
         */
        type FadeEffectOptions = {
            duration: number;
            delay: number;
        };

        /**
         * An object used to customize the `"flip"` effect.
         */
        type FlipEffectOptions = {
            duration: number;
            delay: number;
            direction: string;
        };

        /**
         * An object used to customize the `"float"` effect.
         */
        type FloatEffectOptions = {
            duration: number;
            delay: number;
            direction: string;
        };

        /**
         * An object used to customize the `"fly"` effect.
         */
        type FlyEffectOptions = {
            duration: number;
            delay: number;
            direction: string;
        };

        /**
         * An object used to customize the `"fold"` effect.
         */
        type FoldEffectOptions = {
            duration: number;
            delay: number;
            direction: string;
        };

        /**
         * An object used to customize the `"glide"` effect.
         */
        type GlideEffectOptions = {
            duration: number;
            delay: number;
            angle: number;
            distance: number;
        };

        /**
         * An object used to customize the `"puff"` effect.
         */
        type PuffEffectOptions = {
            duration: number;
            delay: number;
        };

        /**
         * An object used to customize the `"roll"` effect.
         */
        type RollEffectOptions = {
            duration: number;
            delay: number;
            direction: string;
        };

        /**
         * An object used to customize the `"slide"` effect.
         */
        type SlideEffectOptions = {
            duration: number;
            delay: number;
            direction: string;
        };

        /**
         * An object used to customize the `"spin"` effect.
         */
        type SpinEffectOptions = {
            duration: number;
            delay: number;
            direction: string;
            cycles: number;
        };

        /**
         * An object used to customize the `"turn"` effect.
         */
        type TurnEffectOptions = {
            duration: number;
            delay: number;
            direction: string;
        };

        /**
         * An object used to customize the `"zoom"` effect.
         */
        type ZoomEffectOptions = {
            duration: number;
            delay: number;
        };

    }

    /**
     * Provides basic functionality for elements.
     */
    interface Element extends $w.Node, $w.ViewportMixin{
        /**
         * Indicates if an element is currently displayed.
         */
        readonly rendered: boolean;
        /**
         * Adds an event handler that runs when the mouse pointer is moved
         *  onto the element.
         */
        onMouseIn(handler: $w.MouseEventHandler): $w.Element;
        /**
         * Adds an event handler that runs when the mouse pointer is moved
         *  off of the element.
         */
        onMouseOut(handler: $w.MouseEventHandler): $w.Element;
    }

    /**
     * Events are fired when certain actions occur to elements.
     */
    interface Event {
        /**
         * Gets the context of the event on a repeated element.
         */
        readonly context: $w.Event.EventContext;
        /**
         * Gets the element that the event was fired on.
         */
        readonly target: $w.Element;
        /**
         * Gets the type of event that was fired.
         */
        readonly type: string;
    }

    namespace Event {
        /**
         * An object that contains information about the context in which an event was fired.
         */
        type EventContext = {
            /**
             * `"GLOBAL_SCOPE"` for events fired outside
             *  of repeaters, or `"COMPONENT_SCOPE"` for events fired from repeaters.
             */
            type: string;
            /**
             * ID of the repeater item where the
             *  event was fired from.
             */
            itemId: string;
        };

    }

    /**
     * Provides functionality for elements that can set and lose focus.
     * 
     *  The element on the page that is currently active is the element in focus.
     *  Only one element on the page can have focus at any given moment.
     *  Typically, an element exhibits a visual cue, such as a subtle outline,
     *  indicating that it is in focus. The element in focus receives keystroke
     *  events if the user causes any.
     * 
     *  An element receives focus and loses focus (blurs) through user actions,
     *  such as clicking and tabbing, or programmatically, using the
     *  [focus( )](#focus) and [blur( )](#blur) functions.
     */
    interface FocusMixin {
        /**
         * Removes focus from the element.
         */
        blur(): void;
        /**
         * Places focus on the element.
         */
        focus(): void;
        /**
         * Adds an event handler that runs when the element loses focus.
         */
        onBlur(handler: $w.EventHandler): $w.Element;
        /**
         * Adds an event handler that runs when the element receives focus.
         */
        onFocus(handler: $w.EventHandler): $w.Element;
    }

    /**
     * The footer is the area of your site that appears at the bottom and
     *  throughout all of your pages.
     */
    interface Footer extends $w.Element, $w.ClickableMixin, $w.ContainableMixin, $w.StyleMixin{
        /**
         * Gets an object containing information about the footer's styles.
         */
        readonly style: $w.Style;
    }

    /**
     * Provides functionality related to user input elements.
     */
    interface FormElement extends $w.Element, $w.ValidatableMixin, $w.ValueMixin{
        /**
         * Adds an event handler that runs when an input element's value
         *  is changed.
         */
        onChange(handler: $w.EventHandler): $w.Element;
    }

    /**
     * A gallery for displaying multiple items.
     */
    interface Gallery extends $w.Element, $w.HiddenCollapsedMixin, $w.PlayableMixin{
        /**
         * Sets or gets the action that occurs when an item in the gallery is clicked.
         */
        clickAction: string;
        /**
         * Gets the index of the gallery's current item.
         */
        readonly currentIndex: number;
        /**
         * Gets an object containing information about the current item.
         */
        readonly currentItem: $w.Gallery.ImageItem;
        /**
         * Gets an object containing information about the gallery's capabilities.
         */
        readonly galleryCapabilities: $w.Gallery.GalleryCapabilities;
        /**
         * Sets or gets the items in a gallery.
         */
        items: [$w.Gallery.ImageItem];
        /**
         * Determines if a gallery's navigation arrows are shown.
         */
        showNavigationButtons: boolean;
        /**
         * Adds an event handler that runs when a gallery's current item changes.
         */
        onCurrentItemChanged(handler: $w.GalleryItemChangedEventHandler): $w.Gallery;
        /**
         * Adds an event handler that runs when an item in a gallery is
         *  clicked.
         */
        onItemClicked(handler: $w.GalleryItemClickedEventHandler): $w.Gallery;
    }

    namespace Gallery {
        /**
         * An object used by the `galleryCapabilities` property that contains the capabilities of a gallery.
         */
        type GalleryCapabilities = {
            /**
             * Indicates if the gallery supports play operations.
             */
            isPlayable: boolean;
            /**
             * Indicates if the gallery supports the notion of a current item.
             */
            hasCurrentItem: boolean;
            /**
             * Indicates if the gallery supports navigation buttons.
             */
            hasNavigationButtons: boolean;
        };

        /**
         * An object used by the Gallery properties `items` and `currentItem` to represent a single gallery image.
         */
        type ImageItem = {
            /**
             * Item type. Value is `"image"`.
             */
            type: string;
            /**
             * Item slug.
             */
            slug: string;
            /**
             * Image source URL.
             */
            src: string;
            /**
             * Image description. Descriptions over 100 characters are truncated.
             */
            description?: string;
            /**
             * Image title.
             */
            title?: string;
            /**
             * URL of the image's clickable link. See [here]($w.LinkableMixin.html#link) for more information about links.
             */
            link?: string;
        };

        /**
         * An object used by the Gallery properties `items` and `currentItem` to represent a single gallery video.
         */
        type VideoItem = {
            /**
             * Item type. Value is `"video"`.
             */
            type: string;
            /**
             * Item slug.
             */
            slug: string;
            /**
             * Video source URL.
             */
            src: string;
            /**
             * Video description. Descriptions over 100 characters are truncated.
             */
            description?: string;
            /**
             * Video title.
             */
            title?: string;
            /**
             * URL of the video's clickable link. See [here]($w.LinkableMixin.html#link) for more information about links.
             */
            link?: string;
            /**
             * Video thumbnail URL.
             */
            thumbnail?: string;
        };

    }

    /**
     * Event that is fired when a gallery moves to a new image.
     */
    interface GalleryItemChangedEvent extends $w.Event{
        /**
         * Gets the gallery item.
         */
        readonly item: $w.Gallery.ImageItem;
        /**
         * Gets the gallery item's index.
         */
        readonly itemIndex: number;
    }

    /**
     * Event that is fired when an image in a gallery is clicked.
     */
    interface GalleryItemClickedEvent extends $w.GalleryItemChangedEvent, $w.Event{
    }

    /**
     * A [Google Map element](https://www.wix.com/support/html5/article/adding-google-maps)
     *  that allows you to display a given location.
     */
    interface GoogleMap extends $w.Element, $w.HiddenCollapsedMixin{
        /**
         * Sets or gets the location information of a map's marked location.
         */
        location: $w.GoogleMap.MapLocation;
    }

    namespace GoogleMap {
        /**
         * An object used by the `location` property that
         *  contains the attributes of a marked map location.
         */
        type MapLocation = {
            /**
             * The latitude of the location. Must be between -90 and 90.
             */
            latitude: number;
            /**
             * The longitude of the location. Must be between -180 and 180.
             */
            longitude: number;
            /**
             * The description of the location.
             */
            description?: string;
        };

    }

    /**
     * The header is the area of your site that appears at the top and
     *  throughout all of your pages.
     */
    interface Header extends $w.Element, $w.ClickableMixin, $w.ContainableMixin, $w.StyleMixin{
        /**
         * Gets an object containing information about the header's styles.
         */
        readonly style: $w.Style;
    }

    /**
     * Provides functionality for all elements that can be hidden or collapsed.
     */
    interface HiddenCollapsedElement extends $w.Element, $w.HiddenCollapsedMixin{
    }

    /**
     * Provides functionality for all elements that can be hidden or collapsed.
     */
    interface HiddenCollapsedMixin extends $w.HiddenMixin, $w.CollapsedMixin{
    }

    /**
     * Provides functionality for elements that can be hidden.
     * 
     *  To learn about the behavior of a hidden element,
     *  see the [`hidden`](#hidden) property.
     */
    interface HiddenMixin {
        /**
         * Indicates if the element is visible or hidden.
         */
        readonly hidden: boolean;
        /**
         * Indicates if the element is actually visible.
         */
        readonly isVisible: boolean;
        /**
         * Hides the element and sets its `hidden` property
         *  to `true`, using an effect if specified.
         */
        hide(effectName?: string, effectOptions?: $w.EffectOptions.ArcEffectOptions): Promise<void>;
        /**
         * Shows the element and sets its `hidden` property
         *  to `false`, using an effect if specified.
         */
        show(effectName?: string, effectOptions?: $w.EffectOptions.ArcEffectOptions): Promise<void>;
    }

    /**
     * A container for internal or external HTML code. Messages can be sent
     *  from your page code to the code in an HTML component and from the HTML
     *  component to your page code using the [`postMessage()`](#postMessage) and
     *  [`onMessage()`](#onMessage) functions. To learn more about what code an HTML
     *  component can hold, see here.
     * 
     *  For an overview of working with an HTML Component using code, see Working with the HTML Element.
     */
    interface HtmlComponent extends $w.IFrame{
        /**
         * Sets or gets whether the HTML Component displays scrollbars.
         */
        scrolling: string;
        /**
         * Sets or gets the URL of the HTML Component's code.
         */
        src: string;
        /**
         * Allows the HTML Component to be put into full screen mode.
         */
        allowFullScreen(): $w.HtmlComponent;
        /**
         * Adds an event handler that runs when the HTML Component
         *  sends a message.
         */
        onMessage(handler: $w.HtmlComponentMessageEventHandler): $w.HtmlComponent;
        /**
         * Sends a message to the HTML Component.
         */
        postMessage(message: string): void;
    }

    /**
     * Event that is fired when the code in an HtmlComponent sends a message.
     */
    interface HtmlComponentMessageEvent extends $w.Event{
        /**
         * Gets the event data.
         */
        readonly data: $w.Element;
    }

    /**
     * Provides functionality for iframe-based elements, such as `HtmlComponent`.
     */
    interface IFrame extends $w.Element, $w.HiddenCollapsedMixin{
    }

    /**
     * Event that is fired when a user hovers over a star on a ratings input component.
     */
    interface IconMouseInEvent extends $w.Event{
        /**
         * Gets the display label that corresponds to the icon that the mouse entered.
         */
        readonly label: string;
        /**
         * Gets the value (1-5) that corresponds to the icon that the mouse entered.
         */
        readonly value: number;
    }

    /**
     * Images are images stored in the Media Manager
     *  or retrieved from an external web location.
     * 
     *  The URL formats for images are:
     * 
     *  + Images from the Media Manager: `wix:image://v1//#originWidth=&originHeight=[&watermark=]`
     *  + Images from the web: `http(s)://`
     */
    interface Image extends $w.Element, $w.HiddenCollapsedMixin, $w.LinkableMixin, $w.ClickableMixin{
        /**
         * Sets or gets an image's alt text.
         */
        alt: string;
        /**
         * Sets or gets the action that occurs when an image is clicked.
         */
        clickAction: string;
        /**
         * Sets or gets the file location of the image.
         */
        src: string;
        /**
         * Sets or gets an image's tooltip.
         */
        tooltip: string;
    }

    /**
     * Event that is fired when the keyboard is pressed.
     */
    interface KeyboardEvent extends $w.Event{
        /**
         * Indicates if the Option key on a Mac or Alt key on a PC was pressed.
         */
        readonly altKey: boolean;
        /**
         * Indicates if the Control (Ctrl) key was pressed.
         */
        readonly ctrlKey: boolean;
        /**
         * Gets a string representation of the key that was pressed.
         */
        readonly key: string;
        /**
         * Indicates if the ⌘ Command key on a Mac or ⊞ Windows key on a PC
         *  was pressed.
         */
        readonly metaKey: boolean;
        /**
         * Indicates if the Shift key was pressed.
         */
        readonly shiftKey: boolean;
    }

    interface LabelMixin {
        /**
         * Sets or gets the label of an element.
         */
        label: string;
    }

    /**
     * Provides functionality for elements that can acts as links.
     */
    interface LinkableMixin {
        /**
         * Sets or gets the element's link.
         */
        link: string;
        /**
         * Sets or gets the target of the element's link.
         */
        target: string;
    }

    /**
     * A container for media items.
     */
    interface MediaBox extends $w.Element, $w.HiddenCollapsedMixin, $w.Background{
    }

    /**
     * A menu container is a container that holds the elements in a
     *  mobile menu. You can add and remove elements to the container to customize
     *  your site's mobile menu. The menu only appears in the mobile version of your
     *  site.
     */
    interface MenuContainer extends $w.Element{
        /**
         * Closes a mobile menu.
         */
        close(): Promise<void>;
        /**
         * Opens a mobile menu.
         */
        open(): Promise<void>;
    }

    /**
     * Event that is fired when the mouse is clicked.
     */
    interface MouseEvent extends $w.Event{
        /**
         * Gets the distance in pixels between the mouse pointer and the
         *  left edge of the browser's viewable area.
         */
        readonly clientX: number;
        /**
         * Gets the distance in pixels between the mouse pointer and the
         *  top edge of the browser's viewable area.
         */
        readonly clientY: number;
        /**
         * Gets the distance in pixels between the mouse pointer and the
         *  left edge of the element that triggered this event.
         */
        readonly offsetX: number;
        /**
         * Gets the distance in pixels between the mouse pointer and the
         *  top edge of the element that triggered this event.
         */
        readonly offsetY: number;
        /**
         * Gets the distance in pixels between the mouse pointer and the
         *  left edge of the page.
         */
        readonly pageX: number;
        /**
         * Gets the distance in pixels between the mouse pointer and the
         *  top edge of the page.
         */
        readonly pageY: number;
        /**
         * Gets the distance in pixels between the mouse pointer and the
         *  left edge of the screen or screens.
         */
        readonly screenX: number;
        /**
         * Gets the distance in pixels between the mouse pointer and the
         *  top edge of the screen or screens.
         */
        readonly screenY: number;
    }

    /**
     * Provides basic functionality for all Wix objects, including objects
     *  that are not [elements]($w.Element.html).
     */
    interface Node {
        /**
         * Indicates if an element appears on all pages or only on the current page.
         */
        readonly global: boolean;
        /**
         * Gets the element's ID.
         */
        readonly id: string;
        /**
         * Gets the element's parent element.
         */
        readonly parent: $w.Node;
        /**
         * Gets the element's type.
         */
        readonly type: string;
        /**
         * Scrolls the page to the element using an animation.
         */
        scrollTo(): Promise<void>;
    }

    /**
     * A page is a web page that can contain other elements.
     */
    interface Page extends $w.Element, $w.ClickableMixin, $w.ContainableMixin{
        /**
         * Gets the page's SEO description.
         */
        readonly description: string;
        /**
         * Gets the page's keywords.
         */
        readonly keywords: [string];
        /**
         * Gets the page's title.
         */
        readonly title: string;
        /**
         * Indicates if the page is included in the site's menu.
         */
        readonly visibleInMenu: boolean;
    }

    /**
     * Provides functionality for elements that can be played.
     */
    interface PlayableMixin {
        /**
         * Indicates if the element is currently playing.
         */
        readonly isPlaying: boolean;
        /**
         * Moves to the next item.
         */
        next(): Promise<$w.Element>;
        /**
         * Adds an event handler that runs when playback is paused.
         */
        onPause(handler: $w.EventHandler): $w.Gallery;
        /**
         * Adds an event handler that runs when playback is started or restarted.
         */
        onPlay(handler: $w.EventHandler): $w.Gallery;
        /**
         * Pauses playback.
         */
        pause(): void;
        /**
         * Begins or resumes playback.
         */
        play(): void;
        /**
         * Moves to the previous image or slide.
         */
        previous(): Promise<$w.Element>;
    }

    /**
     * A [quick action bar](https://support.wix.com/en/article/adding-and-setting-up-the-quick-action-bar-on-your-mobile-site)
     *  helps your visitors contact you instantly from their mobile devices. You can
     *  choose which actions appear on it and customize the design to match your site.
     */
    interface QuickActionBar extends $w.HiddenCollapsedMixin, $w.StyleMixin{
        /**
         * Sets or gets a quick action bar's alignment.
         */
        alignment: boolean;
        /**
         * Sets or gets a quick action bar's color scheme.
         */
        colorScheme: string;
        /**
         * Sets or gets whether a quick action bar's color scheme is inverted.
         */
        invertColorScheme: boolean;
        /**
         * Sets or gets whether a quick action bar's labels are shown.
         */
        showLabels: boolean;
        /**
         * Adds an event handler that runs when an item in a quick action bar is
         *  clicked.
         */
        onItemClicked(handler: $w.QuickActionBarItemClickedEventHandler): $w.QuickActionBar;
    }

    /**
     * Event that is fired when a quick action bar item is clicked.
     */
    interface QuickActionBarItemClickedEvent extends $w.Event{
        /**
         * Gets the gallery item.
         */
        readonly item: $w.QuickActionBarItemClickedEvent.QuickActionBarItem;
        /**
         * Gets the quick action bar item's index.
         */
        readonly itemIndex: number;
    }

    namespace QuickActionBarItemClickedEvent {
        /**
         * An object representing a quick action bar item.
         */
        type QuickActionBarItem = {
            /**
             * The quick action bar item type.
             */
            itemType: string;
            /**
             * The quick action bar item label.
             */
            label: string;
            /**
             * The quick action bar item link.
             */
            link: string;
        };

    }

    /**
     * Radio button groups are used for selecting one of a number of
     *  options. Radio button groups consist of a list of [options](#Option). Each
     *  [option](#Option) contains a label, which is what the user sees, and a
     *  value, which is what is used in code and stored in you collections.
     */
    interface RadioButtonGroup extends $w.FormElement, $w.HiddenCollapsedMixin, $w.DisabledMixin, $w.FocusMixin, $w.ClickableMixin, $w.StyleMixin, $w.RequiredMixin{
        /**
         * Sets or gets the options in a radio button group.
         */
        options: [$w.RadioButtonGroup.Option];
        /**
         * Sets or gets the index of the selected option.
         */
        selectedIndex: number;
        /**
         * Gets an object containing information about the radio button group's styles.
         */
        readonly style: $w.Style;
        /**
         * Sets or gets the value of the selected option.
         */
        value: string;
    }

    namespace RadioButtonGroup {
        /**
         * An object used by the `options` property that contains the attributes of a radio button item.
         */
        type Option = {
            /**
             * The value of the radio button option. This is what you use in code and is what is stored in your collections.
             */
            value: string;
            /**
             * The label of the radio button option. This is what a user sees.
             */
            label?: string;
        };

    }

    /**
     * Provides functionality for input elements which support readonly mode.
     */
    interface ReadOnlyMixin {
        /**
         * Sets or gets if a user can modify the value of the input element.
         */
        readOnly: boolean;
    }

    /**
     * A repeating layout.
     */
    interface Repeater extends $w.Element, $w.HiddenCollapsedMixin{
        /**
         * Sets or gets the repeater data.
         */
        data: [object];
        /**
         * Runs a function for each repeated item.
         */
        forEachItem(callback: $w.ForItemCallback): void;
        /**
         * Runs a function for each repeated item with the given IDs.
         */
        forItems(itemIds: [string], callback: $w.ForItemCallback): void;
        /**
         * Sets the function that runs when a new repeated item is created.
         */
        onItemReady(handler: $w.ItemReadyEventHandler): $w.Repeater;
        /**
         * Sets the function that runs when a repeated item is removed.
         */
        onItemRemoved(handler: $w.ItemRemovedEventHandler): $w.Repeater;
    }

    /**
     * Provides functionality for input elements can be required to have a value.
     */
    interface RequiredMixin {
        /**
         * Sets or gets whether an input element is required to have a value.
         */
        required: boolean;
    }

    /**
     * A `Slide` from a `Slideshow` that can contain other elements.
     */
    interface Slide extends $w.Element, $w.Background, $w.ContainableMixin{
        /**
         * Gets the slide's ID.
         */
        readonly id: string;
        /**
         * Gets the name of the slide.
         */
        readonly name: string;
    }

    /**
     * Slideshows are playable containers for slides.
     */
    interface Slideshow extends $w.Element, $w.HiddenCollapsedMixin, $w.PlayableMixin, $w.ClickableMixin, $w.ContainableMixin{
        /**
         * Gets the index of the slideshow's current slide.
         */
        readonly currentIndex: number;
        /**
         * Gets the slideshow's current slide.
         */
        readonly currentSlide: $w.Slide;
        /**
         * Sets or gets whether a slideshow's navigation buttons are shown.
         */
        showNavigationButtons: boolean;
        /**
         * Set or returns whether a slideshow's slide buttons are shown.
         */
        showSlideButtons: boolean;
        /**
         * Gets a list of all the slides contained in the slideshow.
         */
        readonly slides: [$w.Slide];
        /**
         * Change the slideshow's current slide to a specific slide or index.
         */
        changeSlide(slideReference: number): Promise<$w.Slide>;
        /**
         * Adds an event handler that runs when the slideshow moves to a new slide.
         */
        onChange(eventHandler: $w.EventHandler): $w.Slideshow;
    }

    /**
     * An object representing an element's styles.
     * 
     * Elements that expose a style property can be styled programmatically.
     * You cannot programmatically style elements that do not expose a style property.
     *  
     * The following elements expose the style property:
     * 
     *  + [`Box`]($w.Box.html)
     *  + [`Button`]($w.Button.html)
     *  + [`Checkbox`]($w.Checkbox.html)
     *  + [`CheckboxGroup`]($w.CheckboxGroup.html)
     *  + [`Dropdown`]($w.Dropdown.html)
     *  + [`Footer`]($w.Footer.html)
     *  + [`Header`]($w.Header.html)
     *  + [`ProgressBar`]($w.ProgressBar.html)
     *  + [`QuickActionBar`]($w.QuickActionBar.html)
     *  + [`RadioButtonGroup`]($w.RadioButtonGroup.html)
     *  + [`TextBox`]($w.TextBox.html)
     *  + [`TextInput`]($w.TextInput.html) 
     *  + [`UploadButton`]($w.UploadButton.html)
     */
    interface Style {
        /**
         * Sets or gets the background color of an element.
         */
        backgroundColor: string;
        /**
         * Sets or gets the border color of an element.
         */
        borderColor: string;
        /**
         * Sets or gets the border radius of an element.
         */
        borderRadius: string;
        /**
         * Sets or gets the border width of an element.
         */
        borderWidth: string;
        /**
         * Sets or gets the text color of an element.
         */
        color: string;
        /**
         * Sets or gets the foreground color of an element.
         */
        foregroundColor: string;
    }

    /**
     * Provides functionality for elements that can be styled.
     */
    interface StyleMixin {
        /**
         * Gets an object containing information about the element's styles.
         */
        readonly style: $w.Style;
    }

    /**
     * A table for displaying data.
     */
    interface Table extends $w.Element, $w.HiddenCollapsedMixin, $w.ClickableMixin{
        /**
         * Sets or gets the defining properties of the columns in a table.
         */
        columns: [$w.Table.Column];
        /**
         * Sets the function that is called when a new page of table data is to be displayed.
         */
        dataFetcher: Function;
        /**
         * Sets or gets the table's pagination options.
         */
        pagination: $w.Table.PaginationOptions;
        /**
         * Sets or gets the table's row data.
         */
        rows: [object];
        /**
         * Adds an event handler that runs when a table cell is selected.
         */
        onCellSelect(eventHandler: $w.TableCellEventHandler): $w.Table;
        /**
         * Adds an event handler that runs when the table's data is changed.
         */
        onDataChange(eventHandler: $w.EventHandler): void;
        /**
         * Adds an event handler that runs when a table row is selected.
         */
        onRowSelect(eventHandler: $w.TableRowEventHandler): $w.Table;
        /**
         * Fetches the most current data and updates the table.
         */
        refresh(): void;
        /**
         * Selects a table row by index.
         */
        selectRow(index: number): void;
        /**
         * Updates a the row data of a single row at the specified index.
         */
        updateRow(index: number, rowData: object): void;
    }

    namespace Table {
        /**
         * An object used by the `columns` property that
         *  contains the properties that define a table column. Table columns do not
         *  store any data.
         */
        type Column = {
            /**
             * The column ID.
             */
            id: string;
            /**
             * The location of the data displayed
             *  in the column.
             * 
             *  When the table is populated by a connection to a dataset, the `dataPath`
             *  value is a field key from the collection that the dataset is connected to.
             * 
             *  When the table is populated by using the [`rows`](#rows) or
             *  [`dataFetcher`](#dataFetcher) properties, the `dataPath` value is one of the
             *  property keys from the table's row objects.
             */
            dataPath: string;
            /**
             * The column header label.
             */
            label: string;
            /**
             * The type of data in this column: `"number"`, `"string"`, `"date"`, `"image"`, `"bool"`, or `"richText"`.
             */
            type: string;
            /**
             * The pixel width of the column.
             */
            width?: number;
            /**
             * Whether the column is visible.
             */
            visible?: boolean;
            /**
             * The location of the links used when
             *  the items in the column are clicked.
             * 
             *  When the table is populated by a connection to a dataset, the `linkPath`
             *  value is a field key from the collection that the dataset is connected to.
             *  The collection field can be a [regular field](https://support.wix.com/en/article/about-database-collections#regular-fields)
             *  that contains URLs or a [calculated field](https://support.wix.com/en/article/about-database-collections#calculated-fields)
             *  that contains relative links to dynamic pages.
             * 
             *  When the table is populated by using the [`rows`](#rows) or
             *  [`dataFetcher`](#dataFetcher) properties, the `linkPath` value is one of the
             *  property keys from the table's rows objects.
             *  The property values associated with that key contain URLs or relative links.
             */
            linkPath?: string;
        };

        /**
         * An object used by the `pagination` property that
         * contains the pagination options which determine if and how the table
         * is paginated.
         */
        type PaginationOptions = {
            /**
             * The type of pagination to use: `"normal"`, `"pagination"`, or `"virtual"`.
             */
            type: string;
            /**
             * The number of rows per page.
             */
            rowsPerPage: number;
        };

        /**
         * An object used by the `pagination` property that
         * contains the pagination parameters which determine if and how the table
         * is paginated.
         */
        type PaginationParam = {
            type: string;
            rowsPerPage: number;
        };

    }

    /**
     * Event that is fired when a table cell is selected.
     */
    interface TableCellEvent extends $w.Event{
        /**
         * Gets the column ID of the selected cell.
         */
        readonly cellColumnId: string;
        /**
         * Gets the data from the selected cell.
         */
        readonly cellData: string;
        /**
         * Gets the row index of the selected cell.
         */
        readonly cellRowIndex: number;
    }

    /**
     * Event that is fired when a table row is selected.
     */
    interface TableRowEvent extends $w.Event{
        /**
         * Gets the data for the selected row.
         */
        readonly rowData: object;
        /**
         * Gets the index of the selected row.
         */
        readonly rowIndex: number;
    }

    /**
     * Provides functionality for text elements.
     */
    interface Text extends $w.Element, $w.HiddenCollapsedMixin, $w.ClickableMixin{
        /**
         * Sets or gets the contents of a text element using standard HTML.
         */
        html: string;
        /**
         * Sets or gets the plain-text contents of a text element.
         */
        text: string;
    }

    /**
     * An input element for capturing large amounts of text.
     */
    interface TextBox extends $w.FormElement, $w.DisabledMixin, $w.TextInputMixin, $w.HiddenCollapsedMixin, $w.FocusMixin, $w.ReadOnlyMixin, $w.ClickableMixin, $w.StyleMixin, $w.RequiredMixin{
        /**
         * Gets an object containing information about the text box's styles.
         */
        readonly style: $w.Style;
        /**
         * Sets or gets a text input's value.
         */
        value: string;
        /**
         * Determines if the text contains line breaks when its value is read.
         */
        wrap: string;
    }

    /**
     * An input element for capturing small amounts of text.
     */
    interface TextInput extends $w.FormElement, $w.HiddenCollapsedMixin, $w.DisabledMixin, $w.TextInputMixin, $w.FocusMixin, $w.ReadOnlyMixin, $w.ClickableMixin, $w.StyleMixin, $w.RequiredMixin{
        /**
         * Sets or gets the input type of an Input element.
         */
        inputType: string;
        /**
         * Sets or gets the maximum value for a text input element whose
         *  type is set to **Number**.
         */
        max: number;
        /**
         * Sets or gets the minimum value for a text input element whose
         *  type is set to **Number**.
         */
        min: number;
        /**
         * Gets an object containing information about the text input's styles.
         */
        readonly style: $w.Style;
        /**
         * Sets or gets a text input's value.
         */
        value: string;
    }

    /**
     * Provides functionality for elements that accept text as input.
     */
    interface TextInputMixin {
        /**
         * Sets or gets the maximum number of characters that can be entered.
         */
        maxLength: number;
        /**
         * Sets or gets the element's placeholder text.
         */
        placeholder: string;
        /**
         * Adds an event handler that runs when the cursor is inside the
         *  input element and a key is pressed.
         */
        onKeyPress(eventHandler: $w.KeyboardEventHandler): $w.Element;
    }

    /**
     * An upload button enables users to upload files to your site.
     */
    interface UploadButton extends $w.FormElement, $w.HiddenCollapsedMixin, $w.DisabledMixin, $w.FocusMixin, $w.StyleMixin, $w.RequiredMixin{
        /**
         * Sets or gets the label on the upload button.
         */
        buttonLabel: string;
        /**
         * Sets or gets the type of file that a user can upload.
         */
        fileType: string;
        /**
         * Gets an object containing information about the upload button's styles.
         */
        readonly style: $w.Style;
        /**
         * Returns a list of files that are pending upload.
         */
        value: [$w.UploadButton.File];
        /**
         * Clears the files that are pending upload.
         */
        reset(): void;
        /**
         * Uploads the files that the user has chosen.
         */
        startUpload(): Promise<$w.UploadButton.UploadedFile>;
    }

    namespace UploadButton {
        /**
         * The object used by the `value` property that represents
         *  files ready for upload.
         */
        type File = {
            /**
             * The file's name.
             */
            name: string;
            /**
             * The file's size in bytes.
             */
            size: string;
        };

        /**
         * The object returned by the `startUpload()` function's
         *  Promise when an upload fails.
         */
        type UploadError = {
            /**
             * Numeric The error's code.
             */
            errorCode: string;
            /**
             * The error's description.
             */
            errorDescription: string;
        };

        /**
         * The object returned by the `startUpload()` function's
         *  Promise that contains the URL of the successfully uploaded file.
         */
        type UploadedFile = {
            /**
             * The Wix URL of the uploaded file.
             */
            url: string;
        };

    }

    /**
     * Provides functionality for elements that can be validated.
     * 
     * Certain input elements contain properties that are used in basic form
     * validation, such as [`required`]($w.RequiredMixin.html#required) and
     * [`maxlength`]($w.TextInputMixin.html#maxlength). More complex validation
     * logic is achieved using the properties and functions below.
     * 
     * Basic validation of elements against the constraints set in the Editor or
     * programmatically is always peformed, regardless of any custom validation.
     * 
     * However, sometimes more complex validation is needed, including validations
     * that depend on more than one element. This is typically achieved by adding
     * custom validation logic in an event handler that you set using the input
     * element's [`onCustomValidation()`](#onCustomValidation) function. Within that
     * handler, you call the `reject()` function to indicate that the element is
     * invalid. The element's validity is checked when the value of the element
     * changes either by user interaction or programmatically.
     * 
     * Note that validations other than **required**, including custom validations,
     * are not run on input elements when they don't have a value.
     */
    interface ValidatableMixin {
        /**
         * Indicates if an input element's value is valid.
         */
        readonly valid: boolean;
        /**
         * Gets a message indicating why the element is invalid, or an
         *  empty string if the message is valid.
         */
        readonly validationMessage: string;
        /**
         * Gets a ValidityState object that contains
         *  detailed information about the validity states of the element.
         */
        readonly validity: $w.ValidatableMixin.ValidityState;
        /**
         * Adds an event handler that runs when the element's validation is checked.
         */
        onCustomValidation(validator: $w.Validator): void;
        /**
         * Resets the element's visual validity indication.
         */
        resetValidityIndication(): void;
        /**
         * Updates the element's visual validity indication based on its current validity state.
         */
        updateValidityIndication(): void;
    }

    namespace ValidatableMixin {
        /**
         * Contains detailed information about the validity states of an element.
         */
        type ValidityState = {
            /**
             * `true` if the element's custom
             *  validity message has been set to a non-empty string.
             */
            customError: boolean;
            /**
             * `true` if the element meets all
             *  constraint validations.
             */
            valid: boolean;
            /**
             * `true` if the element's
             *  [`required`]($w.RequiredElement.html#required) property is `true`, but
             *  it does not contain a value.
             */
            valueMissing: boolean;
            /**
             * `true` if the element's value
             *  does not match its type when the type is email or url.
             */
            typeMismatch: boolean;
            /**
             * `true` if the element's
             *  value does not match its pattern validation.
             */
            patternMismatch: boolean;
            /**
             * `true` if the length of the
             *  element's value exceeds its [`maxlength`]($w.TextInputElement.html#maxlength)
             *  property.
             */
            tooLong: boolean;
            /**
             * `true` if the length of the
             *  element's value is smaller than its minlength.
             */
            tooShort: boolean;
            /**
             * `true` if the element's
             *  value is less than the its [`min`]($w.TextInput.html#min) property.
             */
            rangeUnderflow: boolean;
            /**
             * `true` if the element's
             *  value is more than the its [`max`]($w.TextInput.html#max) property.
             */
            rangeOverflow: boolean;
            /**
             * `true` if the element is
             *  an upload button that is required and a file has been selected but not
             *  uploaded.
             */
            fileNotUploaded: boolean;
            stepMismatch: boolean;
            /**
             * `true` if the element's value
             *  cannot be converted to a value
             */
            badInput: boolean;
        };

    }

    interface ValueMixin {
        /**
         * Sets or gets an element's value.
         */
        value: any;
        /**
         * Adds an event handler that runs when an input element's value
         *  is changed.
         */
        onChange(handler: $w.EventHandler): $w.Element;
    }

    /**
     * Vector images are digital illustrations based on geometric shapes.
     *  They maintain their high quality when resized.
     */
    interface VectorImage extends $w.Element, $w.HiddenCollapsedMixin, $w.LinkableMixin, $w.ClickableMixin{
        /**
         * Sets or gets the file location of the vector image.
         */
        src: string;
    }

    /**
     * An element that displays a video from Vimeo or Youtube.
     */
    interface Video extends $w.Element, $w.HiddenCollapsedMixin{
        /**
         * Sets or gets the URL of the video.
         */
        videoUrl: string;
    }

    /**
     * Provides functionality for elements that can be scrolled into and out
     *  of view.
     */
    interface ViewportMixin {
        /**
         * Adds an event handler that runs when an element is displayed
         *  in the viewable part of the current window.
         */
        onViewportEnter(handler: $w.EventHandler): $w.Element;
        /**
         * Adds an event handler that runs when an element is no longer
         *  displayed in the viewable part of the current window.
         */
        onViewportLeave(handler: $w.EventHandler): $w.Element;
    }

    type EventHandler = (event: $w.Event, $w: $w.$w)=>void;

    type ForItemCallback = ($item: $w.$w, itemData: object, index: number)=>void;

    /**
     * Handles events fired when a gallery moves to a new image.
     */
    type GalleryItemChangedEventHandler = (event: $w.GalleryItemChangedEvent, $w: $w.$w)=>void;

    /**
     * Handles events fired when an image in a gallery is clicked.
     */
    type GalleryItemClickedEventHandler = (event: $w.GalleryItemClickedEvent, $w: $w.$w)=>void;

    /**
     * Handles events fired when the code in an HtmlComponent sends a message.
     */
    type HtmlComponentMessageEventHandler = (event: $w.HtmlComponentMessageEvent, $w: $w.$w)=>void;

    type HtmlElementEventHandler = (event: $w.HtmlComponentMessageEvent, $w: $w.$w)=>void;

    /**
     * Handles events fired when a user hovers over a star on the rating component.
     */
    type IconMouseInEventHandler = (event: $w.IconMouseInEvent)=>void;

    type ItemReadyEventHandler = ($item: $w.$w, itemData: object, index: number)=>void;

    type ItemRemovedEventHandler = (itemData: object)=>void;

    /**
     * Handles events fired when the keyboard is pressed.
     */
    type KeyboardEventHandler = (event: $w.KeyboardEvent, $w: $w.$w)=>void;

    /**
     * Handles events fired when the mouse is clicked.
     */
    type MouseEventHandler = (event: $w.MouseEvent, $w: $w.$w)=>void;

    /**
     * Handles events fired when an item in a quick action bar is clicked.
     */
    type QuickActionBarItemClickedEventHandler = (event: $w.QuickActionBarItemClickedEvent, $w: $w.$w)=>void;

    /**
     * Function that runs when all page elements have finished loading.
     */
    type ReadyHandler = ()=>Promise<void> | void;

    /**
     * Handles events fired when a table cell is selected.
     */
    type TableCellEventHandler = (event: $w.TableCellEvent, $w: $w.$w)=>void;

    /**
     * Handles events fired when a table row is selected.
     */
    type TableRowEventHandler = (event: $w.TableRowEvent, $w: $w.$w)=>void;

    /**
     * Function that runs when custom validation is checked.
     */
    type Validator = (value: string, reject: Function)=>void;

    /**
     * An element for playing audio files.
     */
    interface AudioPlayer extends $w.Element, $w.HiddenCollapsedMixin{
        /**
         * Sets or gets the name of the artist displayed in an audio player.
         */
        artistName: string;
        /**
         * Sets or gets the cover image displayed in an audio player.
         */
        coverImage: string;
        /**
         * Gets the current play time from the beginning of the audio track, in seconds.
         */
        readonly currentTime: number;
        /**
         * Gets the total play time of the audio track, in seconds.
         */
        readonly duration: number;
        /**
         * Indicates if the volume is currently muted.
         */
        readonly isMuted: boolean;
        /**
         * Indicates if an audio track is currently playing.
         */
        readonly isPlaying: boolean;
        /**
         * Sets or gets the file location of the audio file.
         */
        src: string;
        /**
         * Sets or gets the track name displayed in an audio player.
         */
        trackName: string;
        /**
         * Sets or gets an audio player's volume.
         */
        volume: number;
        /**
         * Mutes audio volume.
         */
        mute(): Promise<void>;
        /**
         * Adds an event handler that runs when playback has ended.
         */
        onEnded(handler: $w.EventHandler): $w.AudioPlayer;
        /**
         * Adds an event handler that runs when playback is paused.
         */
        onPause(handler: $w.EventHandler): $w.AudioPlayer;
        /**
         * Adds an event handler that runs when playback is started or restarted.
         */
        onPlay(handler: $w.EventHandler): $w.AudioPlayer;
        /**
         * Adds an event handler that runs when playback progresses.
         */
        onProgress(handler: $w.EventHandler): $w.AudioPlayer;
        /**
         * Pauses playback.
         */
        pause(): Promise<void>;
        /**
         * Begins or resumes playback.
         */
        play(): Promise<void>;
        /**
         * Moves playback to the specified time, in seconds.
         */
        seek(): Promise<void>;
        /**
         * Stops playback.
         */
        stop(): Promise<void>;
        /**
         * Toggles playback.
         */
        togglePlay(): Promise<void>;
        /**
         * Unmutes audio volume.
         */
        unmute(): Promise<void>;
    }

    /**
     * An element for working with paging.
     */
    interface Pagination extends $w.Element, $w.DisabledMixin, $w.HiddenCollapsedMixin, $w.ClickableMixin, $w.ViewportMixin{
        /**
         * Sets or gets the current page.
         */
        currentPage: number;
        /**
         * Sets or gets the total number of pages shown in a pagination bar.
         */
        totalPages: number;
        /**
         * Adds an event handler that runs when the pagination bar
         *  is changed.
         */
        onChange(handler: $w.EventHandler): $w.Pagination;
    }

    /**
     * An element for displaying the status of an ongoing process.
     */
    interface ProgressBar extends $w.Element, $w.HiddenCollapsedMixin, $w.StyleMixin{
        /**
         * Gets an object containing information about the progress bar's styles.
         */
        readonly style: $w.Style;
        /**
         * Sets or gets a progress bar's target value.
         */
        readonly targetValue: number;
        /**
         * Sets or gets a progress bar's value.
         */
        readonly value: number;
    }

    /**
     * A ratings display element allows you to display a value to your users
     *  using icons.
     */
    interface RatingsDisplay extends $w.Element, $w.HiddenCollapsedMixin, $w.ClickableMixin{
        /**
         * Sets or gets the displayed number of ratings.
         */
        numRatings: number;
        /**
         * Sets or gets the displayed rating.
         */
        rating: number;
    }

    /**
     * A ratings input element allows you to capture a value from your users
     *  using icons.
     */
    interface RatingsInput extends $w.FormElement, $w.DisabledMixin, $w.RequiredMixin, $w.HiddenCollapsedMixin, $w.FocusMixin, $w.ClickableMixin, $w.ViewportMixin{
        /**
         * Sets or gets the rating value.
         */
        value: number;
        /**
         * Sets the function that runs when a user's mouse enters one of the rating icons.
         */
        onIconMouseIn(handler: $w.IconMouseInEventHandler): $w.RatingsInput;
    }

    /**
     * RichTextBox is a rich text input as form element
     */
    interface RichTextBox extends $w.FormElement, $w.DisabledMixin, $w.TextInputMixin, $w.HiddenCollapsedMixin, $w.FocusMixin, $w.ReadOnlyMixin, $w.ClickableMixin, $w.RequiredMixin{
    }

    /**
     * Sliders allow users to select a number from a given range.
     */
    interface Slider extends $w.Element, $w.ValueMixin, $w.DisabledMixin, $w.HiddenCollapsedMixin, $w.FocusMixin{
        /**
         * Sets or gets the slider's maximum value.
         */
        max: number;
        /**
         * Sets or gets the slider's minimum value.
         */
        min: number;
        /**
         * Sets or gets a slider's step value.
         */
        step: number;
        /**
         * Sets or gets a slider's step type.
         */
        stepType: string;
        /**
         * Sets or gets the value of the slider.
         */
        readonly value: number;
    }

    /**
     * Switches are used for a single binary choice.
     */
    interface Switch extends $w.Element, $w.DisabledMixin, $w.HiddenCollapsedMixin, $w.FocusMixin, $w.ClickableMixin, $w.ValueMixin, $w.CheckedMixin{
        /**
         * Sets or gets whether a switch is on or off.
         */
        checked: boolean;
    }

    /**
     * An input element for capturing the time of day.
     */
    interface TimePicker extends $w.FocusMixin, $w.DisabledMixin, $w.HiddenCollapsedMixin, $w.RequiredMixin, $w.ReadOnlyMixin, $w.FormElement{
        /**
         * Sets or gets the number of minutes the time picker steps.
         */
        readonly step: number;
        /**
         * Sets or gets whether the time picker uses 12-hour or 24-hour format.
         */
        readonly useAmPmFormat: boolean;
        /**
         * Sets or gets a time picker's value.
         */
        readonly value: string;
    }

    /**
     * An element for presenting videos.
     */
    interface VideoPlayer extends $w.Element, $w.HiddenCollapsedMixin{
        /**
         * Gets the current play time from the beginning of the current video, in seconds.
         */
        readonly currentTime: number;
        /**
         * Gets the total play time of the current video, in seconds.
         */
        readonly duration: number;
        /**
         * Indicates if the volume is currently muted.
         */
        readonly isMuted: boolean;
        /**
         * Indicates if a video is currently playing.
         */
        readonly isPlaying: boolean;
        /**
         * Sets or gets the file location of the current video.
         */
        src: string;
        /**
         * Sets or gets the title displayed in a video player.
         */
        title: string;
        /**
         * Sets or gets the video player volume.
         */
        volume: number;
        /**
         * Mutes video volume.
         */
        mute(): Promise<void>;
        /**
         * Adds an event handler that runs when playback has ended.
         */
        onEnded(handler: $w.EventHandler): $w.VideoPlayer;
        /**
         * Adds an event handler that runs when playback is paused.
         */
        onPause(handler: $w.EventHandler): $w.VideoPlayer;
        /**
         * Adds an event handler that runs when playback is started or restarted.
         */
        onPlay(handler: $w.EventHandler): $w.VideoPlayer;
        /**
         * Adds an event handler that runs when playback progresses.
         */
        onProgress(handler: $w.EventHandler): $w.VideoPlayer;
        /**
         * Pauses playback.
         */
        pause(): Promise<void>;
        /**
         * Begins or resumes playback.
         */
        play(): Promise<void>;
        /**
         * Moves playback to the specified time, in seconds.
         */
        seek(): Promise<void>;
        /**
         * Pauses playback.
         */
        stop(): Promise<void>;
        /**
         * Toggles playback.
         */
        togglePlay(): Promise<void>;
        /**
         * Unmutes video volume.
         */
        unmute(): Promise<void>;
    }

    /**
     * An icon that leads users to the shopping cart.
     */
    interface CartIcon extends $w.Element, $w.HiddenCollapsedMixin{
        /**
         * Adds multiple products to the shopping cart.
         */
        addProductsToCart(products: [$w.CartIcon.AddToCartItem]): Promise<void>;
        /**
         * Adds a product to the shopping cart.
         */
        addToCart(productID: string, quantity?: number, options?: $w.CartIcon.AddToCartOptions): Promise<void>;
    }

    namespace CartIcon {
        /**
         * An object used to pass a custom text field when adding a product to
         *  the shopping cart with options.
         */
        type AddToCartCustomTextField = {
            /**
             * Custom text field title.
             */
            title: string;
            /**
             * Custom text field value.
             */
            value: string;
        };

        /**
         * An object used when adding multiple products to the shopping cart.
         */
        type AddToCartItem = {
            /**
             * The ID of the product to add to the cart.
             */
            productID: string;
            /**
             * Custom custom
             *  text fields to use when adding the product to the cart.
             */
            options?: $w.CartIcon.AddToCartOptions;
        };

        /**
         * An object used when adding a product to the shopping cart with options.
         */
        type AddToCartOptions = {
            /**
             * Product options to use when adding the
             *  product to the cart. The object contains key:value pairs where the key is the
             *  option name and the value is the chosen option value.
             */
            choices: object;
            /**
             * Custom custom
             *  text fields to use when adding the product to the cart.
             */
            customTextField: $w.CartIcon.AddToCartCustomTextField;
        };

    }

    /**
     * A store page for a specific product.
     */
    interface ProductPage extends $w.Element, $w.HiddenCollapsedMixin{
        /**
         * Gets the all the information associated with the current product.
         */
        getProduct(): Promise<$w.ProductPage.StoreProduct>;
    }

    namespace ProductPage {
        /**
         * An object representing a product in a store.
         */
        type StoreProduct = {
            /**
             * Product ID.
             */
            _id: string;
            /**
             * Product name.
             */
            name: string;
            /**
             * Product description.
             */
            description: string;
            /**
             * Main product media item (image or video thumbnail) URL.
             */
            mainMedia: string;
            /**
             * List of product media items.
             */
            mediaItems: [$w.Gallery.ImageItem];
            /**
             * Product stock keeping unit value.
             */
            sku: string;
            /**
             * List of product ribbons.
             */
            ribbons: [$w.ProductPage.StoreProductRibbon];
            /**
             * Product currency.
             */
            currency: string;
            /**
             * Product price.
             */
            price: number;
            /**
             * Discounted product price.
             */
            discountedPrice: number;
            /**
             * Product price formatted with the currency.
             */
            formattedPrice: string;
            /**
             * Discounted product price formatted with the currency.
             */
            formattedDiscountedPrice: string;
            /**
             * Indicates whether inventory is tracked for the product.
             */
            trackInventory: boolean;
            /**
             * Indicates whether the product is in stock.
             */
            inStock: boolean;
            /**
             * Number of units currently in stock.
             */
            quantityInStock: number;
            /**
             * Additional product information sections.
             */
            additionalInfoSections: [$w.ProductPage.StoreProductAdditionalInfoSection];
            /**
             * All the available options for a store product.
             */
            productOptions: $w.ProductPage.StoreProductOptions;
            /**
             * Product page relative URL.
             */
            productPageUrl: string;
            /**
             * Indicates whether product variants are managed.
             */
            manageVariants: boolean;
            /**
             * List of product customization fields.
             */
            customTextField: [$w.ProductPage.StoreProductCustomTextFields];
            /**
             * Product type. Either `"physical"` or `"digital"`.
             */
            productType: string;
            /**
             * Product slug.
             */
            slug: string;
            /**
             * Product weight.
             */
            weight: string;
        };

        /**
         * An object representing an additional info section for a store product.
         */
        type StoreProductAdditionalInfoSection = {
            /**
             * Section title.
             */
            title: string;
            /**
             * Section description.
             */
            description: string;
        };

        /**
         * An object representing a custom text field for a store product.
         */
        type StoreProductCustomTextFields = {
            /**
             * Product customization field title.
             */
            title: string;
            /**
             * Maximum length of product customization field in characters.
             */
            maxLength: string;
        };

        /**
         * An object representing an option for a store product.
         */
        type StoreProductOption = {
            /**
             * Option type. Either `"color"` or `"drop_down"`.
             */
            optionType: string;
            /**
             * Option name.
             */
            name: string;
            /**
             * Option choices.
             */
            choices: [$w.ProductPage.StoreProductOptionsChoice];
        };

        /**
         * An object representing all the available options for a store product.
         */
        type StoreProductOptions = {
            /**
             * Name of the option. This key name is
             *  dependent on the options added to the product. For example, if a product
             *  has a size option, this key will be something like "Size".
             */
            optionKey: $w.ProductPage.StoreProductOption;
        };

        /**
         * An object representing an options choice for a store product.
         */
        type StoreProductOptionsChoice = {
            /**
             * Choice value.
             */
            value: number;
            /**
             * Choice description.
             */
            description: number;
            /**
             * Choice media.
             */
            media: $w.ProductPage.StoreProductOptionsChoiceMedia;
            /**
             * Indicates whether the product with this choice is in stock.
             */
            inStock: boolean;
            /**
             * Indicates whether the product with this option is visible.
             */
            visible: boolean;
        };

        /**
         * An object representing the choice media
         */
        type StoreProductOptionsChoiceMedia = {
            /**
             * Main choice media item (image or video thumbnail) URL.
             */
            mainMedia: string;
            /**
             * List of choice media items.
             */
            mediaItems: [$w.Gallery.ImageItem];
        };

        /**
         * An object representing a ribbon for a store product.
         */
        type StoreProductRibbon = {
            /**
             * Ribbon text.
             */
            text: string;
        };

    }

    /**
     * A thank you page displayed when an order is created.
     */
    interface ThankYouPage extends $w.Element, $w.HiddenCollapsedMixin{
        /**
         * Gets the order associated with the current page.
         */
        getOrder(): Promise<$w.ThankYouPage.Order>;
    }

    namespace ThankYouPage {
        /**
         * An object that contains address information.
         */
        type Address = {
            /**
             * Address address line.
             */
            addressLine: string;
            /**
             * Address subdivision.
             */
            subdivision: string;
            /**
             * Address city.
             */
            city: string;
            /**
             * Address postal code.
             */
            postalCode: string;
            /**
             * Address country.
             */
            country: string;
            /**
             * Address in human readable format.
             */
            formatted: string;
        };

        /**
         * An object representing an order's billing info.
         */
        type BillingInfo = {
            /**
             * First name.
             */
            firstName: string;
            /**
             * Last name.
             */
            lastName: string;
            /**
             * Email address.
             */
            email: string;
            /**
             * Phone number.
             */
            phone: string;
            /**
             * Company name.
             */
            company: string;
            /**
             * Company name.
             */
            vatId: $w.ThankYouPage.VatId;
            /**
             * Billing address.
             */
            address: $w.ThankYouPage.Address;
        };

        /**
         * An object containing information about a buyer.
         */
        type BuyerInfo = {
            /**
             * Buyer's unique ID.
             */
            id: string;
            /**
             * Buyer's email address.
             */
            email: string;
            /**
             * Buyer's first name.
             */
            firstName: string;
            /**
             * Buyer's last name.
             */
            lastName: string;
            /**
             * Buyer's identity.
             *  One of:
             * 
             *  + `"ADMIN"`: Buyer is the site owner.
             *  + `"MEMBER"`: Buyer is a logged-in site member.
             *  + `"VISITOR"`: Buyer is not logged in.
             *  + `"CONTACT"`: A contact has been created for the buyer.
             */
            identityType: string;
            /**
             * Buyer's phone number.
             */
            phone: string;
        };

        /**
         * An object representing a custom text field.
         */
        type CustomTextField = {
            /**
             * Field title.
             */
            title: string;
            /**
             * Field value.
             */
            value: string;
        };

        /**
         * An object representing a line item in a shopping cart.
         */
        type LineItem = {
            /**
             * Name of the line item.
             */
            name: string;
            /**
             * Notes about the line item.
             */
            notes: string;
            /**
             * Line item price.
             */
            price: string;
            /**
             * Line item product ID.
             */
            productId: string;
            /**
             * Line item quantity.
             */
            quantity: number;
            /**
             * Line item stock keeping unit.
             */
            sku: string;
            /**
             * Total price charged to the customer for all line items after any applicable discounts.
             */
            totalPrice: string;
            /**
             * Line item weight.
             */
            weight: string;
            /**
             * Type of the line item.
             *  One of:
             * 
             *  + `"DIGITAL"`: Digital item.
             *  + `"PHYSICAL"`: Physical item.
             *  + `"CUSTOM_AMOUNT_ITEM"`: Item with a custom price.
             *  + `"UNSPECIFIED"`: Type can't be classified due to an error.
             */
            lineItemType: string;
            /**
             * Line item options.
             */
            options: [$w.ThankYouPage.Option];
            /**
             * Media item.
             */
            mediaItem: $w.ThankYouPage.MediaItem;
            /**
             * Custom text.
             */
            customTextFields: [$w.ThankYouPage.CustomTextField];
            /**
             * Line item index.
             */
            index: number;
        };

        /**
         * An object representing a media item.
         */
        type MediaItem = {
            /**
             * Type of the media item.
             *  One of:
             * 
             *  + `"IMAGE"`: Image item.
             *  + `"UNSPECIFIED_MEDIA_TYPE_ITEM"`: Media item type can't be classified due to an error.
             */
            mediaType: string;
            /**
             * Media item URL.
             */
            url: string;
            /**
             * Media item height.
             */
            height: number;
            /**
             * Media item width.
             */
            width: number;
        };

        /**
         * An object representing a line item option.
         */
        type Option = {
            /**
             * Name of the product option.
             */
            option: string;
            /**
             * Selected option.
             */
            selection: string;
        };

        /**
         * An object representing an order.
         */
        type Order = {
            /**
             * Unique order identifier.
             */
            _id: string;
            /**
             * Date the order was created.
             */
            _dateCreated: Date;
            /**
             * Running order number.
             */
            number: number;
            /**
             * Order currency.
             */
            currency: string;
            /**
             * Billing information.
             */
            billingInfo: $w.ThankYouPage.BillingInfo;
            /**
             * Buyer information.
             */
            buyerInfo: $w.ThankYouPage.BuyerInfo;
            /**
             * Order items.
             */
            lineItems: [$w.ThankYouPage.LineItem];
            /**
             * Order totals.
             */
            totals: $w.ThankYouPage.Totals;
            /**
             * The unit in which the order's weight is
             *  measured. Either `"KG"` or `"LB"`.
             */
            weightUnit: string;
            /**
             * Shipping information.
             */
            shippingInfo: $w.ThankYouPage.ShippingInfo;
            /**
             * A note added by the buyer.
             */
            buyerNote: string;
        };

        /**
         * An object representing an order's totals.
         */
        type OrderTotals = {
            /**
             * The subtotal of all the order's line items, excluding tax.
             */
            subtotal: number;
            /**
             * The total shipping price, including tax.
             */
            shipping: number;
            /**
             * The total amount of tax.
             */
            tax: string;
            /**
             * The total calculated discount amount.
             */
            discount: number;
            /**
             * The total price.
             */
            total: number;
            /**
             * The total weight of the order's items.
             */
            weight: number;
            /**
             * The total quantity of the the order's line items.
             */
            quantity: number;
        };

        /**
         * An object representing an order's shipping details.
         */
        type PickupDetails = {
            /**
             * Pickup instructions.
             */
            pickupInstructions: string;
            /**
             * Pickup address.
             */
            pickupAddress: $w.ThankYouPage.Address;
            /**
             * First name.
             */
            firstName: string;
            /**
             * Last name.
             */
            lastName: string;
            /**
             * Email address.
             */
            email: string;
            /**
             * Phone number.
             */
            phone: string;
        };

        /**
         * An object representing an order's shipping details.
         */
        type ShipmentDetails = {
            /**
             * Shipping address.
             */
            address: $w.ThankYouPage.Address;
            /**
             * First name.
             */
            firstName: string;
            /**
             * Last name.
             */
            lastName: string;
            /**
             * Email address.
             */
            email: string;
            /**
             * Phone number.
             */
            phone: string;
        };

        /**
         * An object representing an order's shipping info.
         */
        type ShippingInfo = {
            /**
             * Delivery option information.
             */
            deliveryOption: string;
            /**
             * Estimated delivery time.
             */
            estimatedDeliveryTime: string;
            shipmentDetails: $w.ThankYouPage.ShipmentDetails;
            pickupDetails: $w.ThankYouPage.PickupDetails;
        };

        /**
         * An object representing an order's totals.
         */
        type Totals = {
            /**
             * The subtotal of all the order's line items, excluding tax.
             */
            subtotal: number;
            /**
             * The total shipping price, including tax.
             */
            shipping: number;
            /**
             * The total amount of tax.
             */
            tax: string;
            /**
             * The total calculated discount amount.
             */
            discount: number;
            /**
             * The total price.
             */
            total: number;
            /**
             * The total weight of the order's items.
             */
            weight: number;
            /**
             * The total quantity of the the order's line items.
             */
            quantity: number;
        };

        /**
         * An object that contains VAT information.
         */
        type VatId = {
            /**
             * VAT number.
             */
            number: string;
            /**
             * VAT type. Either `"CFP"` or `"CPNJ"`.
             */
            type: string;
        };

    }

}

declare namespace wix_dataset {
    /**
     * A [dataset](wix-dataset.html) connects page elements to a set of items in a data collection.
     */
    interface Dataset {
        /**
         * Returns the current item.
         */
        getCurrentItem(): object;
        /**
         * Returns the current item's index.
         */
        getCurrentItemIndex(): number;
        /**
         * Gets the index of the dataset's current page.
         */
        getCurrentPageIndex(): number;
        /**
         * Returns the selected items.
         */
        getItems(fromIndex: number, numberOfItems: number): Promise<wix_dataset.Dataset.GetItemsResult>;
        /**
         * Gets the dataset's page size.
         */
        getPageSize(): number;
        /**
         * Returns the number of items in the dataset that match its filter criteria.
         */
        getTotalCount(): number;
        /**
         * Gets the number of pages in the dataset.
         */
        getTotalPageCount(): number;
        /**
         * Indicates if there is a next item.
         */
        hasNext(): boolean;
        /**
         * Indicates if there is a next page of data.
         */
        hasNextPage(): boolean;
        /**
         * Indicates if there is a previous item.
         */
        hasPrevious(): boolean;
        /**
         * Indicates if there is a previous page of data.
         */
        hasPreviousPage(): boolean;
        /**
         * Loads the next page of data in addition to the current data.
         */
        loadMore(): Promise<void>;
        /**
         * Loads the specified page.
         */
        loadPage(pageIndex: number): Promise<[object]>;
        /**
         * Create a new blank item.
         */
        new(): Promise<void>;
        /**
         * Saves the current item and moves to the next item.
         */
        next(): Promise<object>;
        /**
         * Moves to the next page of data.
         */
        nextPage(): Promise<[object]>;
        /**
         * Adds an event handler that runs just after a save.
         */
        onAfterSave(handler: wix_dataset.Dataset.AfterSaveHandler): void;
        /**
         * Adds an event handler that runs just before a save.
         */
        onBeforeSave(handler: wix_dataset.Dataset.BeforeSaveHandler): void;
        /**
         * Adds an event handler that runs when the current index changes.
         */
        onCurrentIndexChanged(handler: wix_dataset.Dataset.CurrentIndexChangedHandler): void;
        /**
         * Adds an event handler that runs when an error occurs.
         */
        onError(handler: wix_dataset.Dataset.ErrorHandler): void;
        /**
         * Adds an event handler that runs when a value of the current item changes.
         */
        onItemValuesChanged(handler: wix_dataset.Dataset.ItemValuesChangedHandler): void;
        /**
         * Adds an event handler that runs when the dataset is ready.
         */
        onReady(handler: wix_dataset.Dataset.ReadyHandler): void;
        /**
         * Saves the current item and moves to the previous item.
         */
        previous(): Promise<object>;
        /**
         * Moves to the previous page of data.
         */
        previousPage(): Promise<[object]>;
        /**
         * Refetches the contents of the dataset from the collection.
         */
        refresh(): Promise<void>;
        /**
         * Removes the current item.
         */
        remove(): Promise<void>;
        /**
         * Reverts the current item to its saved value.
         */
        revert(): Promise<void>;
        /**
         * Saves the current item.
         */
        save(): Promise<object>;
        /**
         * Sets the current item by index.
         */
        setCurrentItemIndex(index: number): Promise<void>;
        /**
         * Updates the value of a field in the current item.
         */
        setFieldValue(fieldKey: string, value: any): void;
        /**
         * Updates the values of a set of fields in the current item.
         */
        setFieldValues(fieldValues: object): void;
        /**
         * Sets the dataset filter.
         */
        setFilter(filter: wix_data.WixDataFilter): Promise<void>;
        /**
         * Sets the dataset's page size.
         */
        setPageSize(pageSize: number): Promise<void>;
        /**
         * Sets the dataset sort order.
         */
        setSort(sort: wix_data.WixDataSort): Promise<void>;
    }

    namespace Dataset {
        /**
         * An object representing a dataset error.
         */
        type DatasetError = {
            /**
             * Error code.
             */
            code: string;
            /**
             * Error message.
             */
            message: string;
        };

        /**
         * An object used by the `getItems()` function that contains the items retrieved and the total number of items in the dataset that match its filter criteria
         */
        type GetItemsResult = {
            /**
             * List of items objects where key:value pairs are the field keys and field values of the retrieved items, including all hidden fields.
             */
            items: [object];
            /**
             * The number of items in the dataset that match its filter criteria.
             */
            totalCount: number;
            /**
             * The index in the dataset of the first item in the items property.
             */
            offset: number;
        };

        /**
         * An after save event handler.
         */
        type AfterSaveHandler = (itemBeforeSave: object, itemAfterSave: object)=>void;

        /**
         * A before save event handler.
         */
        type BeforeSaveHandler = ()=>Promise<boolean>;

        /**
         * A current item index change event handler.
         */
        type CurrentIndexChangedHandler = (index: number)=>void;

        /**
         * An error event handler.
         */
        type ErrorHandler = (operation: string, error: wix_dataset.Dataset.DatasetError)=>void;

        /**
         * A current item value change event handler.
         */
        type ItemValuesChangedHandler = (itemBeforeChange: object, updatedItem: object)=>void;

        /**
         * A dataset ready event handler.
         */
        type ReadyHandler = ()=>void;

    }

    /**
     * A [dataset](wix-dataset.html) connects page elements on a dynamic page to a set of items in a data collection.
     */
    interface DynamicDataset extends wix_dataset.Dataset{
        /**
         * Gets the next dynamic page URL.
         */
        getNextDynamicPage(): Promise<string>;
        /**
         * Gets the previous dynamic page URL.
         */
        getPreviousDynamicPage(): Promise<string>;
    }

}

declare namespace site_monitoring {
    /**
     * A single record of a Wix site event in JSON format.
     */
    interface LogEntry {
        /**
         * Unique identifier for the log entry.
         */
        readonly insertId: string;
        /**
         * Payload of the log entry in JSON format.
         */
        readonly jsonPayload: site_monitoring.LogEntry.LogEntryJsonPayload;
        /**
         * Additional information about the log entry.
         */
        readonly labels: site_monitoring.LogEntry.LogEntryLabels;
        /**
         * Additional information about a potentially long-running operation associated with the log entry.
         */
        readonly operation: site_monitoring.LogEntry.LogEntryOperation;
        /**
         * Time the log entry was received by site monitoring.
         */
        readonly receiveTimestamp: string;
        /**
         * Severity of the log entry.
         */
        readonly severity: string;
        /**
         * Source code location information associated with the log entry.
         */
        readonly sourceLocation: site_monitoring.LogEntry.LogEntrySourceLocation;
        /**
         * Time the site event occurred.
         */
        readonly timestamp: string;
    }

    namespace LogEntry {
        /**
         * Payload of the log entry in JSON format.
         */
        type LogEntryJsonPayload = {
            /**
             * Payload message.
             */
            message: string;
        };

        /**
         * Additional information about the log entry.
         */
        type LogEntryLabels = {
            /**
             * [`baseUrl`](wix-location.html#baseUrl) of the site with which the log entry is associated.
             */
            siteUrl: string;
            /**
             * Name of Wix application with which the log entry is associated, such as Stores or Bookings. The generic namespace `Corvid` represents site code not associated with a specific Wix application. Currently only the `Corvid` namespace is supported.
             */
            namespace: string;
            /**
             * Unique identifier for the site. Does not change even if the site name or other site attributes change.
             */
            tenantId: string;
            /**
             * Indicates the viewing mode from which the log entry originates.
             *  One of the following:
             * 
             *  + `"Preview"`: Preview mode.
             *  + `"Site"`: Published site mode.
             */
            viewMode: string;
            /**
             * Unique identifier for a specific site [`revision`](wix-site.html#revision). You can use the `revision` property together with the Release Manager to monitor and debug new revisions of your site.
             */
            revision: string;
        };

        /**
         * Additional information about a potentially long-running operation associated with the log entry.
         */
        type LogEntryOperation = {
            /**
             * Unique identifier useful for linking together all log entries associated with a specific operation.
             */
            id: string;
            /**
             * Context of the operation, such as a URL path for page code or a web module function name.
             */
            producer: string;
        };

        /**
         * Source code location information associated with the log entry. Currently only applicable for backend log entries with the `Corvid` namespace.
         */
        type LogEntrySourceLocation = {
            /**
             * Name of the source file.
             */
            file: string;
            /**
             * Line within the source file. 1-based. 0 indicates no line number available.
             */
            line: number;
        };

    }

}

declare namespace wix_location {
    /**
     * An object containing information about a location.
     */
    type Location = {
        /**
         * Location path.
         */
        path: string;
    };

    /**
     * Handles location change events.
     */
    type LocationChangeHandler = (event: wix_location.Location)=>void;

}

declare namespace wix_site {
    /**
     * An object that contains information about the site's prefixes.
     */
    type Prefix = {
        /**
         * The name of the prefix.
         */
        name: string;
        /**
         * The type of the prefix: `"dynamicPages"`, `"router"`, or `"app"`.
         */
        type: string;
        /**
         * The prefix.
         */
        prefix: string;
        /**
         * If the prefix is an app's prefix, the `applicationId` property is the app's ID.
         */
        applicationId?: string;
    };

    /**
     * An object that contains information about the site's pages, prefixes, and lightboxes.
     */
    type SiteStructure = {
        /**
         * The pages of the site.
         */
        pages: [wix_site.StructurePage];
        /**
         * The prefixes of the site's routers and dynamic pages.
         */
        prefixes: [wix_site.Prefix];
        /**
         * The site's lightboxes.
         */
        lightboxes: [wix_site.StructureLightbox];
    };

    /**
     * An object that contains information about a lightbox on the site.
     */
    type StructureLightbox = {
        /**
         * The name of the lightbox.
         */
        name: string;
    };

    /**
     * An object that contains information about a page on the site.
     */
    type StructurePage = {
        /**
         * The of the page.
         */
        name: string;
        /**
         * The type of the page: `"static"` or `"template"`.
         */
        type: string;
        /**
         * The URL of the page. If the page is a `static` page the `url` property is the page's SEO URL.
         */
        url?: string;
        /**
         * If the page is an app page, the `applicationId` property is the app's ID.
         */
        applicationId?: string;
        /**
         * If the page is a router or dynamic page, the `prefix` property is the page's prefix.
         */
        prefix?: string;
        /**
         * If the page is the Home page, `isHomePage` is `true`. Otherwise, it does not exist.
         */
        isHomePage?: boolean;
    };

}

declare namespace wix_storage {
    /**
     * Used for storing local, session, or memory key/value data in the visitor's browser.
     */
    interface Storage {
        /**
         * Removes **all** items from local, session, or memory storage.
         */
        clear(): void;
        /**
         * Gets an item from local, session, or memory storage.
         */
        getItem(key: string): string;
        /**
         * Removes an item from local, session, or memory storage.
         */
        removeItem(key: string): void;
        /**
         * Stores an item in local, session, or memory storage.
         */
        setItem(key: string, value: string): void;
    }

}

declare namespace wix_window {
    /**
     * A lightbox pops up on your site to grab your visitor's attention.
     */
    interface lightbox {
        /**
         * Closes the lightbox.
         */
        close(data?: object): void;
        /**
         * Returns the data object that was passed to a lightbox.
         */
        getContext(): object;
    }

    /**
     * The Multilingual API is used when working with the languages in a multilingual site.
     */
    interface multilingual {
        /**
         * Sets or gets the site's current display language.
         */
        readonly currentLanguage: string;
        /**
         * Gets whether the site has been set up to be shown in multiple languages.
         */
        readonly isEnabled: boolean;
        /**
         * Gets information about the site's languages.
         */
        readonly siteLanguages: [wix_window.multilingual.SiteLanguage];
    }

    namespace multilingual {
        /**
         * An object returned by the `siteLanguages` property that contains information about the site's languages.
         */
        type SiteLanguage = {
            /**
             * The language's full name.
             */
            name: string;
            /**
             * The language's locale code, which represents a set of language-related formatting preferences.
             */
            locale: string;
            /**
             * The language's two-letter code.
             */
            languageCode: string;
            /**
             * The language's three-letter country code.
             */
            countryCode: string;
            /**
             * Whether the language is the site's primary language.
             */
            isPrimaryLanguage: boolean;
        };

    }

    /**
     * The Rendering API is used to control when code is run as a page is being loaded.
     */
    interface rendering {
        /**
         * Gets the current environment the rendering process is running in.
         */
        readonly env: string;
        /**
         * **Deprecated:** Gets the current cycle in the rendering process.
         */
        readonly renderCycle: number;
        /**
         * **Deprecated:** Gets data sent from server-side code to client-side code.
         */
        readonly warmupData: boolean;
    }

    /**
     * Objects used when calling the [`trackEvent()`](wix-window.html#trackEvent) function.
     */
    interface trackingParameters {
    }

    namespace trackingParameters {
        /**
         * An object used when sending an AddPaymentInfo track event.
         */
        type AddPaymentInfoEvent = {
            /**
             * Describes option information on a checkout page, such as selected payment method.
             */
            option?: string;
            /**
             * Origin of the event.
             */
            origin?: string;
        };

        /**
         * An object used when sending an AddProductImpression track event.
         */
        type AddProductImpressionEvent = {
            /**
             * Product information.
             */
            contents: [wix_window.trackingParameters.AddProductImpressionEventContents];
            /**
             * Origin of the event.
             */
            origin?: string;
        };

        /**
         * An object used when sending an AddProductImpression track event.
         */
        type AddProductImpressionEventContents = {
            /**
             * Product ID.
             */
            id?: string;
            /**
             * Stock keeping unit code.
             */
            sku?: string;
            /**
             * Product name.
             */
            name: string;
            /**
             * Category of the page or product.
             */
            category?: string;
            /**
             * Product price.
             */
            price?: number;
            /**
             * Currency code.
             */
            currency?: string;
            /**
             * Brand name of the product.
             */
            brand?: string;
            /**
             * Variant of the product.
             */
            variant?: string;
            /**
             * List or collection the product is in.
             */
            list?: string;
            /**
             * Product's position in a list or collection.
             */
            position?: string;
        };

        /**
         * An object used when sending an AddToCart track event.
         */
        type AddToCartEvent = {
            /**
             * Product ID.
             */
            id?: string;
            /**
             * Stock keeping unit code.
             */
            sku?: string;
            /**
             * Product name.
             */
            name: string;
            /**
             * Product price.
             */
            price?: number;
            /**
             * Currency code.
             */
            currency?: string;
            /**
             * Category of the page or product.
             */
            category?: string;
            /**
             * Brand name of the product.
             */
            brand?: string;
            /**
             * Variant of the product.
             */
            variant?: string;
            /**
             * Product's position in a list or collection.
             */
            position?: string;
            /**
             * Product quantity.
             */
            quantity?: number;
            /**
             * Origin of the event.
             */
            origin?: string;
        };

        /**
         * An object used when sending an CheckoutStep track event.
         */
        type CheckoutStepEvent = {
            /**
             * Origin of the event.
             */
            origin?: string;
            /**
             * Checkout step number. Be sure to report
             *  consistent step values. For example, use `3` when this step follows
             *  `StartPayment` and `AddPaymentInfo` events.
             */
            step?: string;
            /**
             * Action the visitor has taken, such as `"Select shipping"`.
             */
            action?: string;
            /**
             * Describes option information on a checkout page, such as selected payment method.
             */
            option?: string;
        };

        /**
         * An object used when sending a ClickProduct track event.
         */
        type ClickProductEvent = {
            /**
             * Product ID.
             */
            id?: string;
            /**
             * Stock keeping unit code.
             */
            sku?: string;
            /**
             * Product name.
             */
            name: string;
            /**
             * Product price.
             */
            price?: number;
            /**
             * Currency code.
             */
            currency?: string;
            /**
             * Category of the page or product.
             */
            category?: string;
            /**
             * Brand name of the product.
             */
            brand?: string;
            /**
             * Variant of the product.
             */
            variant?: string;
            /**
             * List or collection the product is in.
             */
            list?: string;
            /**
             * Product's position in a list or collection.
             */
            position?: string;
            /**
             * Origin of the event.
             */
            origin?: string;
        };

        /**
         * An object used when sending a CustomEvent track event.
         */
        type CustomEvent = {
            /**
             * Product ID.
             */
            event: string;
        };

        /**
         * An object used when sending an InitiateCheckout track event.
         */
        type InitiateCheckoutEvent = {
            /**
             * Product information.
             */
            contents: [wix_window.trackingParameters.InitiateCheckoutEventContents];
            /**
             * Origin of the event.
             */
            origin?: string;
        };

        /**
         * An object used when sending an InitiateCheckout track event.
         */
        type InitiateCheckoutEventContents = {
            /**
             * Product ID.
             */
            id?: string;
            /**
             * Stock keeping unit code.
             */
            sku?: string;
            /**
             * Product name.
             */
            name: string;
            /**
             * Category of the page or product.
             */
            category?: string;
            /**
             * Product price.
             */
            price?: number;
            /**
             * Currency code.
             */
            currency?: string;
            /**
             * Brand name of the product.
             */
            brand?: string;
            /**
             * Variant of the product.
             */
            variant?: string;
            /**
             * Product quantity.
             */
            quantity?: number;
        };

        /**
         * An object used when sending a Purchase track event.
         */
        type PurchaseEvent = {
            /**
             * Product ID.
             */
            id?: string;
            /**
             * Name of the store where the event occurred.
             */
            affiliation?: string;
            /**
             * Total amount of the purchase including shipping, taxes, etc.
             */
            revenue?: number;
            /**
             * Total tax charge.
             */
            tax?: number;
            /**
             * Total shipping charge.
             */
            shipping?: number;
            /**
             * Coupon code applied to the transaction.
             */
            coupon?: string;
            /**
             * Product information.
             */
            contents: [wix_window.trackingParameters.PurchaseEventContents];
            /**
             * Origin of the event.
             */
            origin?: string;
        };

        /**
         * An object used when sending an Purchase track event.
         */
        type PurchaseEventContents = {
            /**
             * Product ID.
             */
            id?: string;
            /**
             * Product name.
             */
            name: string;
            /**
             * Category of the page or product.
             */
            category?: string;
            /**
             * Product price.
             */
            price?: number;
            /**
             * Currency code.
             */
            currency?: string;
            /**
             * Brand name of the product.
             */
            brand?: string;
            /**
             * Variant of the product.
             */
            variant?: string;
            /**
             * Product quantity.
             */
            quantity?: number;
        };

        /**
         * An object used when sending a RemoveFromCart track event.
         */
        type RemoveFromCartEvent = {
            /**
             * Product ID.
             */
            id?: string;
            /**
             * Product name.
             */
            name: string;
            /**
             * Product price.
             */
            price?: number;
            /**
             * Currency code.
             */
            currency?: string;
            /**
             * Category of the page or product.
             */
            category?: string;
            /**
             * Brand name of the product.
             */
            brand?: string;
            /**
             * Variant of the product.
             */
            variant?: string;
            /**
             * Product's position in a list or collection.
             */
            position?: string;
            /**
             * Product quantity.
             */
            quantity?: number;
            /**
             * Origin of the event.
             */
            origin?: string;
        };

        /**
         * An object used when sending an StartPayment track event.
         */
        type StartPaymentEvent = {
            /**
             * Origin of the event.
             */
            origin?: string;
            /**
             * Describes option information on a checkout page, such as selected payment method.
             */
            option?: string;
        };

        /**
         * An object used when sending a ViewContent track event.
         */
        type ViewContentEvent = {
            /**
             * Product ID.
             */
            id?: string;
            /**
             * Stock keeping unit code.
             */
            sku?: string;
            /**
             * Product name.
             */
            name: string;
            /**
             * Product price.
             */
            price?: number;
            /**
             * Currency code.
             */
            currency?: string;
            /**
             * Category of the page or product.
             */
            category?: string;
            /**
             * Brand name of the product.
             */
            brand?: string;
            /**
             * Variant of the product.
             */
            variant?: string;
            /**
             * List or collection the product is in.
             */
            list?: string;
            /**
             * Product's position in a list or collection.
             */
            position?: string;
            /**
             * Origin of the event.
             */
            origin?: string;
        };

    }

    /**
     * An object used when opening a modal window.
     */
    type OpenModalOptions = {
        /**
         * Width of the modal window.
         */
        width: number;
        /**
         * Height of the modal window.
         */
        height: number;
    };

    /**
     * An object used for providing options for the `scrollTo()` method.
     */
    type ScrollToOptions = {
        /**
         * Indicates whether to scroll with an animation. Defaults to `true`.
         */
        scrollAnimation: boolean;
    };

    /**
     * An object returned by the `getBoundingRect()` function that contains information about the window's size, the document's size, and the current scroll position.
     */
    type WindowSizeInfo = {
        /**
         * An object with `height` and `width` key:value pairs containing the size of the viewable area of the current browser window.
         */
        window: object;
        /**
         * An object with `height` and `width` key:value pairs containing the size of the actual body of the page, which may be larger or smaller than the current window.
         */
        document: object;
        /**
         * An object with `x` and `y` key:value pairs containing the scroll offset of the page within the window from the top-left corner.
         */
        scroll: object;
    };

}

declare namespace wix_http_functions {
    /**
     * An object representing an incoming request received by a call to an HTTP function.
     */
    interface WixHttpFunctionRequest {
        /**
         * Returns the base URL of a call to an HTTP function.
         */
        readonly baseUrl: string;
        /**
         * Returns an object representing the body of the incoming call to an HTTP function.
         */
        readonly body: wix_http_functions.WixHttpFunctionRequest.WixHttpFunctionRequestBody;
        /**
         * Returns the function name of a call to an HTTP function.
         */
        readonly functionName: string;
        /**
         * Returns the HTTP header fields used in a call to an HTTP function.
         */
        readonly headers: object;
        /**
         * Returns the IP address of the client who called the HTTP function.
         */
        readonly ip: string;
        /**
         * Returns the HTTP method used in calling an HTTP function.
         */
        readonly method: string;
        /**
         * Returns the path of the URL used to call an HTTP function.
         */
        readonly path: [string];
        /**
         * Returns the query fields and values of the URL used to call an HTTP function.
         */
        readonly query: object;
        /**
         * Returns the full URL of a call to an HTTP function.
         */
        readonly url: string;
    }

    namespace WixHttpFunctionRequest {
        /**
         * An object returned by the `body` property representing the body of a call to an HTTP function.
         */
        type WixHttpFunctionRequestBody = {
            /**
             * Returns a Promise which resolves to the body of the call as a string.
             */
            "text()": Promise<string>;
            /**
             * Returns a Promise which resolves to the body of the call as a JSON object.
             */
            "json()": Promise<object>;
        };

    }

    /**
     * An object representing a response to an HTTP function request.
     */
    interface WixHttpFunctionResponse {
        /**
         * Sets or gets the body of the response as a string or binary buffer.
         */
        body: number;
        /**
         * Sets or gets the HTTP response header fields.
         */
        headers: object;
        /**
         * Sets or gets the HTTP status code of the response.
         */
        status: number;
    }

    /**
     * An object used to customize a response to an HTTP function call.
     */
    type WixHttpFunctionResponseOptions = {
        /**
         * The response's HTTP status code.
         */
        status?: number;
        /**
         * The response's body.
         */
        body?: string;
        /**
         * The response's header fields. The `headers` property contains an object of `key:value` pairs where the `key` is the header field name and the `value` is the header field value.
         */
        headers?: object;
    };

}

declare namespace wix_crm_backend {
    /**
     * Events that are fired by actions relating to site contacts.
     */
    interface Events {
        /**
         * An event that fires when a new workflow card is created.
         */
        onCardCreated(event: wix_crm_backend.Events.CardCreatedEvent): void;
        /**
         * An event that fires when a workflow card is moved.
         */
        onCardMoved(event: wix_crm_backend.Events.CardMovedEvent): void;
        /**
         * An event that fires when a workflow card is moved.
         */
        onCardRestored(event: wix_crm_backend.Events.CardRestoredEvent): void;
        /**
         * An event that fires when a user submits a form.
         */
        onFormSubmit(event: wix_crm_backend.Events.FormSubmitEvent): void;
    }

    namespace Events {
        /**
         * An object representing a created card.
         */
        type CardCreatedEvent = {
            /**
             * ID of the card's workflow.
             */
            workflowId: string;
            /**
             * Name of the card's workflow.
             */
            workflowName: string;
            /**
             * ID of the card's phase.
             */
            phaseId: string;
            /**
             * Name of the card's phase.
             */
            phaseName: string;
            /**
             * The card that was created.
             */
            card: wix_crm_backend.workflows.Card;
        };

        /**
         * An object representing a moved card.
         */
        type CardMovedEvent = {
            /**
             * ID of the card's workflow.
             */
            workflowId: string;
            /**
             * Name of the card's workflow.
             */
            workflowName: string;
            /**
             * ID of the card's new phase.
             */
            newPhaseId: string;
            /**
             * Name of the card's new phase.
             */
            newPhaseName: string;
            /**
             * The card that was moved.
             */
            card: wix_crm_backend.workflows.Card;
            /**
             * ID of the card's old phase.
             */
            previousPhaseId: string;
            /**
             * Name of the card's old phase.
             */
            previousPhaseName: string;
        };

        /**
         * An object representing a moved card.
         */
        type CardRestoredEvent = {
            /**
             * ID of the workflow the card was restored to.
             */
            workflowId: string;
            /**
             * Name of the workflow the card was restored to.
             */
            workflowName: string;
            /**
             * ID of the phase the card was restored to.
             */
            phaseId: string;
            /**
             * Name of the phase the card was restored to.
             */
            phaseName: string;
            /**
             * The card that was restored.
             */
            card: wix_crm_backend.workflows.Card;
        };

        /**
         * An object representing an attachment to a form.
         */
        type FormAttachment = {
            /**
             * Name of the attachment.
             */
            name: string;
            /**
             * URL of the attachment.
             */
            url: string;
            /**
             * Type of attachment.
             * One of:
             * 
             * + `"UNDEFINED"`
             * + `"DOCUMENT"`
             * + `"IMAGE"`
             * + `"VIDEO"`
             */
            type: string;
        };

        /**
         * An object representing a form field.
         */
        type FormField = {
            /**
             * Name of the field.
             */
            fieldName: string;
            /**
             * Value of the field.
             */
            fieldValue: string;
        };

        /**
         * An object representing a form.
         */
        type FormSubmitEvent = {
            /**
             * Contact ID of the user submitting the form.
             */
            contactId: string;
            /**
             * Name of the form.
             */
            formName: string;
            /**
             * Date and time that the form was submitted.
             */
            submissionTime: Date;
            /**
             * The form's attachments.
             */
            attachments: [wix_crm_backend.Events.FormAttachment];
            /**
             * Data submitted in the form. The object contains key:value pairs where the key is the field name and the value is the contents of the field.
             */
            submissionData: [wix_crm_backend.Events.FormField];
        };

    }

    /**
     * The Notifications API is used to send notifications to the site owner and contributors.
     */
    interface notifications {
        /**
         * Sends a notification.
         */
        notify(body: string, channels: [string], options: wix_crm_backend.notifications.NotificationOptions): Promise<void>;
    }

    namespace notifications {
        /**
         * An object containing information about where to navigate when a notification is clicked.
         */
        type ActionTarget = {
            /**
             * URL to navigate to when the `actionTitle` text is clicked.
             */
            url?: string;
        };

        /**
         * An object representing notification options.
         */
        type NotificationOptions = {
            /**
             * Notification title. Only displayed on mobile and browser notifications. Max length: 512 characters.
             */
            title?: string;
            /**
             * Call to action text to be clicked on. When clicked, navigates to the `actionTarget` URL. Max length: 512 characters.
             */
            actionTitle?: string;
            /**
             * Where to navigate to when the `actionTitle` text is clicked.
             */
            actionTarget?: wix_crm_backend.notifications.ActionTarget;
            /**
             * Contributor that will receive the notifications, based on their assigned roles.
             *  One of:
             * 
             *  + `"All_Contributors"`: All site contributors, including the site owner.
             *  + `"Owner"`: Only the site owner.
             */
            recipients?: wix_crm_backend.notifications.SiteContributors;
        };

        /**
         * An object containing information about which contributors will receive a notification.
         */
        type SiteContributors = {
            /**
             * Roles to receive the notification.
             * One of:
             * 
             * + `"All_Contributors"`: All site contributors (default).
             * + `"Owner"`: Only the site owner.
             */
            role?: string;
        };

    }

    /**
     * The Tasks API is used to manage a site's tasks.
     */
    interface tasks {
        /**
         * Sets a task as completed.
         */
        completeTask(taskId: string): Promise<string>;
        /**
         * Creates a new task.
         */
        createTask(taskInfo: wix_crm_backend.tasks.TaskInfo): Promise<string>;
        /**
         * Gets a task by ID.
         */
        getTask(taskId: string): Promise<wix_crm_backend.tasks.Task>;
        /**
         * Removes an existing task.
         */
        removeTask(taskId: string): Promise<string>;
        /**
         * Resets a task as not completed.
         */
        resetTask(taskId: string): Promise<string>;
        /**
         * Updates the specified fields of an existing task.
         */
        updateTaskFields(taskId: string, taskInfo: wix_crm_backend.tasks.TaskInfo): Promise<string>;
    }

    namespace tasks {
        /**
         * An object representing a task.
         */
        type Task = {
            /**
             * Task title.
             */
            title: string;
            /**
             * Indicates whether the task has been
             *  completed.
             */
            isCompleted: boolean;
            /**
             * Unique identifier of the site contact
             *  that this task is linked to.
             */
            contactId: string;
            /**
             * Running task version number. Each time an
             *  action is performed on a task its version number is incremented.
             */
            version: number;
            /**
             * Unique task identifier.
             */
            _id: string;
            /**
             * Date the task is due.
             */
            dueDate: Date;
            /**
             * Type of the task's creator. `"USER"`
             *  if the task was created using the site's dashboard. `"APP"` if the task was
             *  created using the [`createTask()`](#createTask) function or if it was created
             *  by an app installed on the site.
             */
            creatorType: string;
            /**
             * When `creatorType` is `"USER"`, the unique
             *  identifier of the user that created the task in the dashboard. Otherwise, `userId` is not
             *  present.
             */
            userId?: string;
            /**
             * When `creatorType` is `"APP"`, the unique
             *  identifier of the application that created the task. Otherwise, `applicationId` is not
             *  present.
             */
            applicationId?: string;
        };

        /**
         * An object representing information for creating or updating a task.
         */
        type TaskInfo = {
            /**
             * Task title.
             */
            title?: string;
            /**
             * Date the task is due.
             */
            dueDate?: Date;
            /**
             * Unique identifier of the site contact
             *  that this task is linked to.
             */
            contactId?: string;
        };

    }

    /**
     * The wix-crm-backend module contains functionality for working with
     *  your site's [workflows](https://support.wix.com/en/article/about-workflows)
     *  from backend code.
     * 
     *  A workflow consists of a number of phases, also known as steps. The final phase
     *  in the workflow, the phase that indicates the workflow has been completed,
     *  is know as the win phase. Each phase can contain cards that move between the phases,
     *  indicating the card's progression through the workflow.
     */
    interface workflows {
        /**
         * Archives a workflow card.
         */
        archiveCard(id: string): Promise<void>;
        /**
         * Creates a new workflow card.
         */
        createCard(workflowId: string, phaseId: string, card: wix_crm_backend.workflows.Card, position?: number): Promise<string>;
        /**
         * Creates a new workflow phase.
         */
        createPhase(workflowId: string, phase: wix_crm_backend.workflows.Phase, position?: number): Promise<string>;
        /**
         * Deletes a workflow card by ID.
         */
        deleteCard(id: string): Promise<void>;
        /**
         * Deletes a workflow phase by ID.
         */
        deletePhase(id: string): Promise<void>;
        /**
         * Gets a workflow card by ID.
         */
        getCard(id: string): Promise<wix_crm_backend.workflows.Card>;
        /**
         * Gets a phase by ID.
         */
        getPhase(id: string): Promise<wix_crm_backend.workflows.Phase>;
        /**
         * Gets a workflow by ID.
         */
        getWorkflow(id: string): Promise<wix_crm_backend.workflows.Workflow>;
        /**
         * Moves a card to a new position within a workflow.
         */
        moveCard(cardId: string, options: wix_crm_backend.workflows.MoveCardOptions): Promise<void>;
        /**
         * Moves a phase to a new position with a workflow.
         */
        movePhase(id: string, options: wix_crm_backend.workflows.MovePhaseOptions): Promise<void>;
        /**
         * Restores an archived workflow card.
         */
        restoreCard(id: string, options: wix_crm_backend.workflows.MoveCardOptions): Promise<void>;
        /**
         * Updates an existing workflow card.
         */
        updateCardFields(id: string, card: wix_crm_backend.workflows.Card): Promise<void>;
        /**
         * Updates an existing workflow phase.
         */
        updatePhaseFields(id: string, phase: wix_crm_backend.workflows.Phase): Promise<void>;
        /**
         * Updates an existing workflow.
         */
        updateWorkflowFields(id: string, workflow: wix_crm_backend.workflows.Workflow): Promise<void>;
    }

    namespace workflows {
        /**
         * An object containing card information.
         */
        type Card = {
            /**
             * Name of the card.
             */
            name: string;
            /**
             * Unique card identifier.
             */
            id: string;
            /**
             * ID of the contact associated with the card.
             */
            contactId: string;
            /**
             * Date the card was created.
             */
            createdDate: Date;
            /**
             * Date the card was last updated.
             */
            updatedDate: Date;
            /**
             * Source that created the card.
             * 
             *  One of:
             * 
             *  + `"Contacts"`
             *  + `"Inbox"`
             *  + `"Invoices"`
             *  + `"Price Quotes"`
             *  + `"Wix Forms"`
             */
            source: string;
        };

        /**
         * An object containing information used when moving a card.
         */
        type MoveCardOptions = {
            /**
             * ID of the phase to move the card to. If omitted, the card remains in the same phase.
             */
            newPhaseId?: string;
            /**
             * Position within the phase to move the card to. If omitted, the card is moved to the top of the phase.
             */
            newPosition?: number;
        };

        /**
         * An object containing information used when moving a phase.
         */
        type MovePhaseOptions = {
            /**
             * ID of the workflow to move the phase to.
             */
            workflowId: string;
            /**
             * Position within the workflow to move the phase to.
             */
            newPosition: number;
        };

        /**
         * An object containing phase information.
         */
        type Phase = {
            /**
             * Name of the phase.
             */
            name: string;
            /**
             * Unique phase identifier.
             */
            id: string;
        };

        /**
         * An object containing information about a workflow.
         */
        type Workflow = {
            /**
             * Unique workflow identifier.
             */
            id: string;
            /**
             * Name of the workflow.
             */
            name: string;
            /**
             * Workflow description.
             */
            description: string;
            /**
             * Date the workflow was created.
             */
            createdDate: Date;
        };

    }

    /**
     * An object that contains information about a site contact.
     */
    type ContactInfo = {
        /**
         * Contact's first name.
         */
        firstName: string;
        /**
         * Contact's last name.
         */
        lastName: string;
        /**
         * Contact's image source.
         */
        picture: string;
        /**
         * List of contact's email addresses.
         */
        emails: [string];
        /**
         * Email address the contact who is also
         *  a member uses to log into the system.
         */
        loginEmail: string;
        /**
         * List of contact's phone numbers.
         */
        phones: [string];
        /**
         * List of contact's labels. [Labels](https://support.wix.com/en/article/creating-contact-labels)
         *  are used to organize contacts. When setting the `labels` property, you can
         *  only list labels that already exist in your site's [Contacts List](https://support.wix.com/en/article/accessing-your-contact-list).
         */
        labels: [string];
        /**
         * Contact's language.
         */
        language: string;
        /**
         * Any
         *  number of custom fields. [Customs fields](https://support.wix.com/en/article/adding-custom-fields-to-contacts)
         *  are used to store additional information about your site's contacts. When
         *  setting a custom field, use key:value pairs where the key matches the names
         *  defined in your site's [Contacts List](https://support.wix.com/en/article/accessing-your-contact-list).
         *  You can only set values for custom fields that already exist in the Contacts
         *  application.
         */
        customFields: string;
    };

}

declare namespace wix_data {
    /**
     * Hooks that can be added to wix-data operations.
     */
    interface Hooks {
        /**
         * A hook that is triggered after a `count()` operation.
         */
        afterCount(count: number, context: wix_data.Hooks.HookContext): Promise<number>;
        /**
         * A hook that is triggered after a `get()` operation.
         */
        afterGet(item: object, context: wix_data.Hooks.HookContext): Promise<object>;
        /**
         * A hook that is triggered after an `insert()` operation.
         */
        afterInsert(item: object, context: wix_data.Hooks.HookContext): Promise<object>;
        /**
         * A hook that is triggered after a `find` operation, for each of the items in the query results.
         */
        afterQuery(item: object, context: wix_data.Hooks.HookContext): Promise<object>;
        /**
         * A hook that is triggered after a `remove()` operation.
         */
        afterRemove(item: object, context: wix_data.Hooks.HookContext): Promise<object>;
        /**
         * A hook that is triggered after an `update()` operation.
         */
        afterUpdate(item: object, context: wix_data.Hooks.HookContext): Promise<object>;
        /**
         * A hook that is triggered before a `count()` operation.
         */
        beforeCount(query: wix_data.WixDataQuery, context: wix_data.Hooks.HookContext): Promise<wix_data.WixDataQuery>;
        /**
         * A hook that is triggered before a `get()` operation.
         */
        beforeGet(itemId: string, context: wix_data.Hooks.HookContext): Promise<string>;
        /**
         * A hook that is triggered before an `insert()` operation.
         */
        beforeInsert(item: object, context: wix_data.Hooks.HookContext): Promise<object>;
        /**
         * A hook that is triggered before a `find()` operation.
         */
        beforeQuery(query: wix_data.WixDataQuery, context: wix_data.Hooks.HookContext): Promise<wix_data.WixDataQuery>;
        /**
         * A hook that is called before a `remove()` operation.
         */
        beforeRemove(itemId: string, context: wix_data.Hooks.HookContext): Promise<string>;
        /**
         * A hook that is triggered before an `update()` operation.
         */
        beforeUpdate(item: object, context: wix_data.Hooks.HookContext): Promise<object>;
        /**
         * A hook that is triggered on any error or rejected Promise from any of the wix-data operations.
         */
        onFailure(error: Error, context: wix_data.Hooks.HookContext): Promise<object>;
    }

    namespace Hooks {
        /**
         * An object that contains contextual information about the hook being called.
         */
        type HookContext = {
            /**
             * The name of the collection the hook affects.
             */
            collectionName: string;
            /**
             * The current site user id. If no user is logged in to the site it may be null.
             */
            userId: string;
            /**
             * The permissions role of the current user. Possibilities are: `anonymous`, `siteMember`,  `siteOwner` and `dataOwner`.
             */
            userRole: string;
            /**
             * The item stored in the database before an `update` or `delete` operation.
             * Will be `undefined` for all other operations.
             */
            currentItem: object;
        };

    }

    /**
     * Provides functionality for performing aggregations on collection data.
     */
    interface WixDataAggregate {
        /**
         * Adds a sort to an aggregation, sorting by the items or groups by the specified properties in ascending order.
         */
        ascending(propertyName: string): wix_data.WixDataAggregate;
        /**
         * Refines a `WixDataAggregate` to only contain the average value from each aggregation group.
         */
        avg(propertyName: string, projectedName?: string): wix_data.WixDataAggregate;
        /**
         * Refines a `WixDataAggregate` to contain the item count of each group in the aggregation.
         */
        count(): wix_data.WixDataAggregate;
        /**
         * Adds a sort to an aggregation, sorting by the items or groups by the specified properties in descending order.
         */
        descending(propertyName: string): wix_data.WixDataAggregate;
        /**
         * Filters out items from being used in an aggregation.
         */
        filter(filter: wix_data.WixDataFilter): wix_data.WixDataAggregate;
        /**
         * Groups items together in an aggregation.
         */
        group(propertyName: string): wix_data.WixDataAggregate;
        /**
         * Filters out groups from being returned from an aggregation.
         */
        having(filter: wix_data.WixDataFilter): wix_data.WixDataAggregate;
        /**
         * Limits the number of items or groups the aggregation returns.
         */
        limit(limit: number): wix_data.WixDataAggregate;
        /**
         * Refines a `WixDataAggregate` to only contain the maximum value from each aggregation group.
         */
        max(propertyName: string, projectedName?: string): wix_data.WixDataAggregate;
        /**
         * Refines a `WixDataAggregate` to only contain the minimum value from each aggregation group.
         */
        min(propertyName: string, projectedName?: string): wix_data.WixDataAggregate;
        /**
         * Runs the aggregation and returns the results.
         */
        run(): Promise<wix_data.WixDataAggregateResult>;
        /**
         * Sets the number of items or groups to skip before returning aggregation results.
         */
        skip(skip: number): wix_data.WixDataAggregate;
        /**
         * Refines a `WixDataAggregate` to contain the sum from each aggregation group.
         */
        sum(propertyName: string, projectedName?: string): wix_data.WixDataAggregate;
    }

    /**
     * The results of an aggregation, containing the aggregated values.
     */
    interface WixDataAggregateResult {
        /**
         * Gets the aggregated values.
         */
        readonly items: [object];
        /**
         * Returns the number of values in the aggregate results.
         */
        readonly length: number;
        /**
         * Indicates if the aggregation has more results.
         */
        hasNext(): boolean;
        /**
         * Retrieves the next page of aggregate results.
         */
        next(): Promise<wix_data.WixDataAggregateResult>;
    }

    interface WixDataFilter {
        /**
         * Adds an `and` condition to the query or filter.
         */
        and(query: wix_data.WixDataQuery): wix_data.WixDataQuery;
        /**
         * Refines a query or filter to match items whose specified property value is within a specified range.
         */
        between(propertyName: string, rangeStart: string, rangeEnd: string): wix_data.WixDataQuery;
        /**
         * Refines a query or filter to match items whose specified property value contains a specified string.
         */
        contains(propertyName: string, string: string): wix_data.WixDataQuery;
        /**
         * Refines a query or filter to match items whose specified property value ends with a specified string.
         */
        endsWith(propertyName: string, string: string): wix_data.WixDataQuery;
        /**
         * Refines a query or filter to match items whose specified property value equals the specified value.
         */
        eq(propertyName: string, value: any): wix_data.WixDataQuery;
        /**
         * Refines a query or filter to match items whose specified property value is greater than or equal to the specified value.
         */
        ge(propertyName: string, value: string): wix_data.WixDataQuery;
        /**
         * Refines a query or filter to match items whose specified property value is greater than the specified value.
         */
        gt(propertyName: string, value: string): wix_data.WixDataQuery;
        /**
         * Refines a query or filter to match items whose specified property values equals all of the specified `value` parameters.
         */
        hasAll(propertyName: string, value: string): wix_data.WixDataQuery;
        /**
         * Refines a query or filter to match items whose specified property value equals any of the specified `value` parameters.
         */
        hasSome(propertyName: string, value: string): wix_data.WixDataQuery;
        /**
         * Refines a query or filter to match items whose specified property does not exist or does not have any value.
         */
        isEmpty(propertyName: string): wix_data.WixDataQuery;
        /**
         * Refines a query or filter to match items whose specified property has any value.
         */
        isNotEmpty(propertyName: string): wix_data.WixDataQuery;
        /**
         * Refines a query or filter to match items whose specified property value is less than or equal to the specified value.
         */
        le(propertyName: string, value: string): wix_data.WixDataQuery;
        /**
         * Refines a query or filter to match items whose specified property value is less than the specified value.
         */
        lt(propertyName: string, value: string): wix_data.WixDataQuery;
        /**
         * Refines a query or filter to match items whose specified property value does not equal the specified value.
         */
        ne(propertyName: string, value: any): wix_data.WixDataQuery;
        /**
         * Adds a `not` condition to the query or filter.
         */
        not(query: wix_data.WixDataQuery): wix_data.WixDataQuery;
        /**
         * Adds an `or` condition to the query or filter.
         */
        or(query: wix_data.WixDataQuery): wix_data.WixDataQuery;
        /**
         * Refines a query or filter to match items whose specified property value starts with a specified string.
         */
        startsWith(propertyName: string, string: string): wix_data.WixDataQuery;
    }

    /**
     * Contains functionality for refining a data query.
     */
    interface WixDataQuery {
        /**
         * Adds an `and` condition to the query or filter.
         */
        and(query: wix_data.WixDataQuery): wix_data.WixDataQuery;
        /**
         * Adds a sort to a query or sort, sorting by the specified properties in ascending order.
         */
        ascending(propertyName: string): wix_data.WixDataQuery;
        /**
         * Refines a query or filter to match items whose specified property value is within a specified range.
         */
        between(propertyName: string, rangeStart: string, rangeEnd: string): wix_data.WixDataQuery;
        /**
         * Refines a query or filter to match items whose specified property value contains a specified string.
         */
        contains(propertyName: string, string: string): wix_data.WixDataQuery;
        /**
         * Returns the number of items that match the query.
         */
        count(options?: wix_data.WixDataOptions): Promise<number>;
        /**
         * Adds a sort to a query or sort, sorting by the specified properties in descending order.
         */
        descending(propertyName: string): wix_data.WixDataQuery;
        /**
         * Returns the distinct values that match the query.
         */
        distinct(propertyName: string, options?: wix_data.WixDataOptions): Promise<wix_data.WixDataQueryResult>;
        /**
         * Refines a query or filter to match items whose specified property value ends with a specified string.
         */
        endsWith(propertyName: string, string: string): wix_data.WixDataQuery;
        /**
         * Refines a query or filter to match items whose specified property value equals the specified value.
         */
        eq(propertyName: string, value: any): wix_data.WixDataQuery;
        /**
         * Returns the items that match the query.
         */
        find(options?: wix_data.WixDataOptions): Promise<wix_data.WixDataQueryResult>;
        /**
         * Refines a query or filter to match items whose specified property value is greater than or equal to the specified value.
         */
        ge(propertyName: string, value: string): wix_data.WixDataQuery;
        /**
         * Refines a query or filter to match items whose specified property value is greater than the specified value.
         */
        gt(propertyName: string, value: string): wix_data.WixDataQuery;
        /**
         * Refines a query or filter to match items whose specified property values equals all of the specified `value` parameters.
         */
        hasAll(propertyName: string, value: string): wix_data.WixDataQuery;
        /**
         * Refines a query or filter to match items whose specified property value equals any of the specified `value` parameters.
         */
        hasSome(propertyName: string, value: string): wix_data.WixDataQuery;
        /**
         * Includes referenced items for the specified properties in a query's results.
         */
        include(propertyName: string): wix_data.WixDataQuery;
        /**
         * Refines a query or filter to match items whose specified property does not exist or does not have any value.
         */
        isEmpty(propertyName: string): wix_data.WixDataQuery;
        /**
         * Refines a query or filter to match items whose specified property has any value.
         */
        isNotEmpty(propertyName: string): wix_data.WixDataQuery;
        /**
         * Refines a query or filter to match items whose specified property value is less than or equal to the specified value.
         */
        le(propertyName: string, value: string): wix_data.WixDataQuery;
        /**
         * Limits the number of items the query returns.
         */
        limit(limit: number): wix_data.WixDataQuery;
        /**
         * Refines a query or filter to match items whose specified property value is less than the specified value.
         */
        lt(propertyName: string, value: string): wix_data.WixDataQuery;
        /**
         * Refines a query or filter to match items whose specified property value does not equal the specified value.
         */
        ne(propertyName: string, value: any): wix_data.WixDataQuery;
        /**
         * Adds a `not` condition to the query or filter.
         */
        not(query: wix_data.WixDataQuery): wix_data.WixDataQuery;
        /**
         * Adds an `or` condition to the query or filter.
         */
        or(query: wix_data.WixDataQuery): wix_data.WixDataQuery;
        /**
         * Sets the number of items to skip before returning query results.
         */
        skip(skip: number): wix_data.WixDataQuery;
        /**
         * Refines a query or filter to match items whose specified property value starts with a specified string.
         */
        startsWith(propertyName: string, string: string): wix_data.WixDataQuery;
    }

    /**
     * The results of a data reference query, containing the retrieved items.
     */
    interface WixDataQueryReferencedResult {
        /**
         * Returns the items that match the reference query.
         */
        readonly items: [object];
        /**
         * Returns the total number of items that match the reference query.
         */
        readonly totalCount: number;
        /**
         * Indicates if the reference query has more results.
         */
        hasNext(): boolean;
        /**
         * Indicates if the reference query has previous results.
         */
        hasPrev(): boolean;
        /**
         * Retrieves the next page of reference query results.
         */
        next(): Promise<wix_data.WixDataQueryReferencedResult>;
        /**
         * Retrieves the previous page of reference query results.
         */
        prev(): Promise<wix_data.WixDataQueryReferencedResult>;
    }

    /**
     * The results of a data query, containing the retrieved items.
     */
    interface WixDataQueryResult {
        /**
         * Returns the index of the current results page number.
         */
        readonly currentPage: number;
        /**
         * Returns the items that match the query.
         */
        readonly items: [object];
        /**
         * Returns the number of items in the current results page.
         */
        readonly length: number;
        /**
         * Returns the query page size.
         */
        readonly pageSize: number;
        /**
         * Indicates if referenced items have been trimmed from the results.
         */
        readonly partialIncludes: boolean;
        /**
         * Returns the query used to get the current results.
         */
        readonly query: wix_data.WixDataQuery;
        /**
         * Returns the total number of items that match the query.
         */
        readonly totalCount: number;
        /**
         * Returns the total number of pages the query produced.
         */
        readonly totalPages: number;
        /**
         * Indicates if the query has more results.
         */
        hasNext(): boolean;
        /**
         * Indicates the query has previous results.
         */
        hasPrev(): boolean;
        /**
         * Retrieves the next page of query results.
         */
        next(): Promise<wix_data.WixDataQueryResult>;
        /**
         * Retrieves the previous page of query results.
         */
        prev(): Promise<wix_data.WixDataQueryResult>;
    }

    interface WixDataSort {
        /**
         * Adds a sort to a query or sort, sorting by the specified properties in ascending order.
         */
        ascending(propertyName: string): wix_data.WixDataQuery;
        /**
         * Adds a sort to a query or sort, sorting by the specified properties in descending order.
         */
        descending(propertyName: string): wix_data.WixDataQuery;
    }

    /**
     * An object returned by Wix Data bulk operations.
     */
    type WixDataBulkResult = {
        /**
         * The number of inserted items.
         */
        inserted: number;
        /**
         * The number of updated items.
         */
        updated: number;
        /**
         * The number of skipped items.
         */
        skipped: number;
        /**
         * List of IDs of inserted items.
         */
        insertedItemIds: [string];
        /**
         * List of errors.
         */
        errors: [Error];
    };

    /**
     * An object that you pass as the `options` parameter that modifies how an operation is performed.
     */
    type WixDataOptions = {
        /**
         * Prevents permission checks from running for the operation.
         */
        suppressAuth?: boolean;
        /**
         * Prevents hooks from running for the operation.
         */
        suppressHooks?: boolean;
    };

    /**
     * An object for controlling the order of returned referenced items.
     */
    type WixDataQueryReferencedOptions = {
        /**
         * The order of the returned referenced items. Either "asc" or "desc".
         */
        order: string;
    };

}

declare namespace wix_fetch {
    /**
     * An object returned by the `fetch()` function representing
     *  an HTTP response to a fetch.
     */
    interface WixFetchResponse {
        /**
         * Indicates whether the body of the response has been used yet.
         */
        readonly bodyUsed: boolean;
        /**
         * The response headers.
         */
        readonly headers: object;
        /**
         * Indicates if the request was successful, meaning its `status` is in the range 2xx.
         */
        readonly ok: boolean;
        /**
         * The reponse [status code](https://en.wikipedia.org/wiki/List_of_HTTP_status_codes).
         */
        readonly status: number;
        /**
         * The response [status message](https://en.wikipedia.org/wiki/List_of_HTTP_status_codes).
         */
        readonly statusText: string;
        /**
         * The response URL.
         */
        readonly url: string;
        /**
         * Reads the response body as JSON.
         */
        json(): Promise<object>;
        /**
         * Reads the response body as a string.
         */
        text(): Promise<string>;
    }

    /**
     * An object used by the `fetch()` function representing an HTTPS request.
     */
    type WixFetchRequest = {
        /**
         * The [HTTP method](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods) to use (if omitted, defaults to `"GET"`).
         */
        method: string;
        /**
         * The request headers.
         */
        headers: object;
        /**
         * The request body.
         */
        body: string;
    };

}

declare namespace wix_marketing_backend {
    /**
     * The Coupons API is used to manage your site's coupons.
     */
    interface coupons {
        /**
         * Creates a new coupon.
         */
        createCoupon(couponInfo: wix_marketing_backend.coupons.CouponInfo): Promise<string>;
        /**
         * Deletes an existing coupon.
         */
        deleteCoupon(couponId: string): Promise<void>;
        /**
         * Updates the specified fields of an existing coupon.
         */
        updateCouponFields(couponId: string, couponInfo: wix_marketing_backend.coupons.CouponInfo): Promise<void>;
    }

    namespace coupons {
        /**
         * An object representing information for creating or updating a coupon.
         */
        type CouponInfo = {
            /**
             * Name of coupon.
             */
            name: string;
            /**
             * Coupon code. Must be unique for all coupons in your site. Maximum 20 characters.
             */
            code: string;
            /**
             * Start date and time of coupon.
             */
            startTime: Date;
            /**
             * End date and time of coupon.
             */
            expirationTime?: Date;
            /**
             * The maximum number of times a coupon can be used. Note that multiple purchases by the same customer or purchases by different customers are both counted toward usage limit.
             */
            usageLimit?: number;
            /**
             * Indicates whether the coupon is limited to 1 discount per order. If true and a customer pays for multiple items the coupon applies to, only the lowest priced item is discounted. Coupons with a `bookings` [`namespace`](#CouponScope) are always limited to one item.
             */
            limitedToOneItem?: boolean;
            /**
             * Indicates whether the coupon is currently active.
             */
            active?: boolean;
            /**
             * The coupon is only applicable when the order subtotal is over this amount.
             */
            minimumSubtotal?: number;
            /**
             * Scope of the coupon. When no scope is defined, the coupon applies to all items in all [`namespaces`](#CouponScope) in the site.
             */
            scope?: wix_marketing_backend.coupons.CouponScope;
            /**
             * Coupon type: Free products when making a purchase. Currently only supported for coupons with a `stores` [`namespace`](#CouponScope).
             */
            buyXGetY?: wix_marketing_backend.coupons.CouponTypeBuyXGetY;
            /**
             * Coupon type: Free shipping. If true, the coupon applies to all items in all [`namespaces`](#CouponScope) in the site.
             */
            freeShipping?: boolean;
            /**
             * Coupon type: Fixed price discount.
             */
            moneyOffAmount?: number;
            /**
             * Coupon type: Discount as a percentage.
             */
            percentOffRate?: number;
            /**
             * Coupon type: Specific sale price. Currently only supported for coupons with a `stores` [`namespace`](#CouponScope).
             */
            fixedPriceAmount?: number;
        };

        /**
         * An object containing the scope of a coupon.
         */
        type CouponScope = {
            /**
             * Wix application for which the coupon is applicable.
             * One of the following:
             * 
             *  + `"stores"`
             *  + `"bookings"`
             *  + `"events"`
             */
            namespace: string;
            /**
             * Group within a `namespace` for which the coupon is applicable. If no group is specified, the coupon applies to all items in the namespace. `group` is required in some cases.
             */
            group?: wix_marketing_backend.coupons.ScopeGroup;
        };

        /**
         * An object defining the number of purchases required and the number of free items received for a "Buy X Get Y" coupon type.
         */
        type CouponTypeBuyXGetY = {
            /**
             * Number of purchased items required to receive free items.
             */
            x: number;
            /**
             * Number of items received for free if required number of items were purchased.
             */
            y: number;
        };

        /**
         * An object specifying the group within a [`CouponScope`](#CouponScope)
         * `namespace` for which the coupon is applicable.
         */
        type ScopeGroup = {
            /**
             * Name of the group.
             */
            name: string;
            /**
             * ID of the specific item in the group for which the coupon is applicable. If no `entityId` is specified, the coupon applies to all items in the group. In some cases when a group is specified, an `entityId` is required.
             */
            entityId?: string;
        };

    }

}

declare namespace wix_pay_backend {
    /**
     * Events fired by payments created using the Pay API.
     */
    interface Events {
        /**
         * An event that fires when a payment's transaction status is changed.
         */
        onPaymentUpdate(event: wix_pay_backend.Events.PaymentUpdateEvent): void;
    }

    namespace Events {
        /**
         * An object representing a payment update.
         */
        type PaymentUpdateEvent = {
            /**
             * The payment's information.
             */
            payment: wix_pay.Payment;
            /**
             * Payment status.
             *  One of:
             * 
             *  + `"Successful"`
             *  + `"Pending"`
             *  + `"Failed"`
             *  + `"Chargeback"`
             *  + `"Refunded"`
             *  + `"Offline"`
             *  + `"PartiallyRefunded"`
             *  + `"Cancelled"`
             *  + `"Undefined"`
             */
            status: string;
            /**
             * ID of the payment transaction.
             */
            transactionId: string;
            /**
             * User information.
             */
            userInfo: wix_pay_backend.PaymentUserInfo;
        };

    }

    /**
     * An object representing information for creating a payment.
     */
    type PaymentInfo = {
        /**
         * Total payment amount. Must equal
         *  the sum of the `price` properties in the `items` list while taking the
         *  `quantity` into account.
         */
        amount: number;
        /**
         * Payment currency. A three-letter
         *  [ISO-4217](https://en.wikipedia.org/wiki/ISO_4217) currency code. Defaults to
         *  the currency defined by the site's [Regional Settings](https://support.wix.com/en/article/changing-your-sites-regional-settings).
         */
        currency?: string;
        /**
         * List of payment items.
         */
        items: wix_pay.PaymentItem;
        /**
         * An object representing information about the user. It will be used to prefill
         *  the user info form during the payment process.
         */
        userInfo?: wix_pay_backend.PaymentUserInfo;
    };

    /**
     * An object representing information about the user.
     */
    type PaymentUserInfo = {
        /**
         * User's first name. Value is `null` if
         *  there is no first name information.
         */
        firstName: string;
        /**
         * User's last name. Value is `null` if
         *  there is no last name information.
         */
        lastName: string;
        /**
         * User's phone number. Value is `null` if
         *  there is no phone number information.
         */
        phone: string;
        /**
         * User's email address. Value is `null` if
         *  there is no email address information.
         */
        email: string;
        /**
         * User's country code. A three-letter
         *  [ISO-3166-1](https://en.wikipedia.org/wiki/ISO_3166-1) country code. Value
         *  is `null` if there is no country information.
         */
        countryCode: string;
    };

}

declare namespace wix_router {
    /**
     * An object representing an incoming page request received by a router.
     */
    interface WixRouterRequest {
        /**
         * Returns the base URL of the router request.
         */
        readonly baseUrl: string;
        /**
         * Returns the form factor of the device used to make the router request.
         */
        readonly formFactor: string;
        /**
         * Returns the remote IP address of the router request.
         */
        readonly ip: string;
        /**
         * Returns the names of the pages associated with this router.
         */
        readonly pages: [string];
        /**
         * Returns the path of the router request URL.
         */
        readonly path: [string];
        /**
         * Returns the router prefix of the router request URL.
         */
        readonly prefix: string;
        /**
         * Returns the protocol of the router request URL.
         */
        readonly protocol: string;
        /**
         * Returns the query fields and values of the request URL.
         */
        readonly query: object;
        /**
         * Returns the `referrer` header from the router request.
         */
        readonly referrer: string;
        /**
         * Returns the full URL of the router request.
         */
        readonly url: string;
        /**
         * Returns the details of the current site user who is logged in.
         */
        readonly user: wix_router.WixRouterUser;
        /**
         * Returns the `user-agent` header as sent from the device used to make the router request.
         */
        readonly userAgent: string;
    }

    /**
     * An object representing a response to a request received by a router.
     */
    interface WixRouterResponse {
        /**
         * Sets or gets the data to pass with the response.
         */
        data: object;
        /**
         * Sets or gets the members to be written to the HTML head of the page.
         */
        head: wix_router.WixRouterResponse.HeadOptions;
        /**
         * Sets or gets the response message to be used when responding with status codes 4xx and 5xx.
         */
        message: string;
        /**
         * Sets or gets the page to route to.
         */
        page: string;
        /**
         * Sets or gets the url to redirect to when responding with status codes 301 and 302.
         */
        redirectUrl: string;
        /**
         * Sets or gets the response's HTTP status code.
         */
        status: number;
    }

    namespace WixRouterResponse {
        /**
         * Members of the HTML head.
         */
        type HeadOptions = {
            /**
             * The page title. Written to the `` tag.
             */
            title: string;
            /**
             * The page description. Written to the `">` tag.
             */
            description: string;
            /**
             * The page keywords. Written to the `">` tag.
             */
            keywords: string;
            /**
             * Indicates whether to add a meta tag that prevents search engines from indexing the page. Setting `noIndex` to `true` will add ``.
             */
            noIndex: boolean;
            /**
             * Other meta tags of the head. An object with key:value pairs where the key is the meta tag name and the value is the content.
             */
            metaTags: object;
        };

    }

    /**
     * An object representing a single entry in a sitemap.
     */
    interface WixRouterSitemapEntry {
        /**
         * Sets or gets how frequently the page is likely to change.
         */
        changeFrequency: string;
        /**
         * Sets or gets when was the page data last modified.
         */
        lastModified: Date;
        /**
         * Sets or gets the page name.
         */
        pageName: string;
        /**
         * Sets or gets the priority of this URL relative to other URLs on your site.
         */
        priority: number;
        /**
         * Sets or gets the page title.
         */
        title: string;
        /**
         * Sets or gets the relative url of the page.
         */
        url: string;
    }

    /**
     * An object representing a request for a sitemap.
     */
    interface WixRouterSitemapRequest {
        /**
         * Returns the base URL of the request.
         */
        readonly baseUrl: string;
        /**
         * Sets or gets the page name.
         */
        readonly pageName: string;
        /**
         * Returns the names of the pages associated with this router.
         */
        readonly pages: [string];
        /**
         * Returns the router prefix of the request.
         */
        readonly prefix: string;
        /**
         * Returns the details of the current site user who is logged in.
         */
        readonly user: wix_router.WixRouterUser;
    }

    /**
     * An object that contains information about the current site visitor who is logged in.
     */
    interface WixRouterUser {
        /**
         * Gets the user's ID.
         */
        readonly id: string;
        /**
         * Gets the user's role.
         */
        readonly role: string;
    }

}

declare namespace wix_site_backend {
    /**
     * The General Info API contains functionality for getting
     *  the information about your business that
     *  has been entered in the **General Info** section of your site's **Dashboard**.
     */
    interface generalInfo {
        /**
         * Gets the physical address of the site's business.
         */
        getAddress(): Promise<wix_site_backend.generalInfo.GeneralInfoAddress>;
        /**
         * Gets the site business name.
         */
        getBusinessName(): Promise<string>;
        /**
         * Gets the business hours of the site's business.
         */
        getBusinessSchedule(): Promise<wix_site_backend.generalInfo.GeneralInfoSchedule>;
        /**
         * Gets the site category information.
         */
        getCategories(): Promise<wix_site_backend.generalInfo.GeneralInfoCategories>;
        /**
         * Gets the site description.
         */
        getDescription(): Promise<string>;
        /**
         * Gets the email address used for notifications of activities on your site.
         */
        getEmail(): Promise<string>;
        /**
         * Gets the fax number used for notifications of activities on your site.
         */
        getFax(): Promise<string>;
        /**
         * Gets site language information.
         */
        getLanguage(): Promise<string>;
        /**
         * Gets site locale information.
         */
        getLocale(): Promise<wix_site_backend.generalInfo.GeneralInfoLocale>;
        /**
         * Gets the site logo file name.
         */
        getLogo(): Promise<string>;
        /**
         * Gets site multilingual information.
         */
        getMultilingual(): Promise<wix_site_backend.generalInfo.GeneralInfoLanguages>;
        /**
         * Gets site payment currency information.
         */
        getPaymentCurrency(): Promise<string>;
        /**
         * Gets the phone number used for notifications of activities on your site.
         */
        getPhone(): Promise<string>;
        /**
         * Gets the site display name.
         */
        getSiteDisplayName(): Promise<string>;
        /**
         * Gets site time zone information.
         */
        getTimeZone(): Promise<string>;
    }

    namespace generalInfo {
        /**
         * An object representing a site's corresponding physical address.
         */
        type GeneralInfoAddress = {
            /**
             * Address street.
             */
            street: string;
            /**
             * Address city.
             */
            city: string;
            /**
             * Address country.
             */
            country: string;
            /**
             * Address state.
             */
            state: string;
            /**
             * Address zip code.
             */
            zip: string;
            /**
             * Address description.
             */
            hint: wix_site_backend.generalInfo.GeneralInfoAddressHint;
            /**
             * Whether the business has a physical address.
             */
            isPhysical: boolean;
            /**
             * Address as formatted by Google.
             */
            googleFormattedAddress: string;
            /**
             * Address street number.
             */
            streetNumber: string;
            /**
             * Address apartment number.
             */
            apartmentNumber: string;
            /**
             * Address coordinates.
             */
            coordinates: wix_site_backend.generalInfo.GeneralInfoAddressCoordinates;
        };

        /**
         * An object representing the coordinates of the site address.
         */
        type GeneralInfoAddressCoordinates = {
            /**
             * Address latitude.
             */
            latitude: string;
            /**
             * Address longitude.
             */
            longitude: string;
        };

        /**
         * An object representing a description of a site's address.
         */
        type GeneralInfoAddressHint = {
            /**
             * Address description.
             */
            text: string;
            /**
             * Whether description is shown before, after, or instead of the actual address.
             */
            placement: string;
        };

        /**
         * An object representing the categories that describe your site's business.
         */
        type GeneralInfoCategories = {
            /**
             * Primary site category.
             */
            primary: string;
            /**
             * List of secondary site categories.
             */
            secondary: [string];
        };

        /**
         * An object representing the site's languages.
         */
        type GeneralInfoLanguages = {
            /**
             * List supported languages.
             */
            supportedLanguages: [wix_site_backend.generalInfo.GeneralInfoLanguagesSupported];
            /**
             * Whether to automatically redirect users based on their browser's settings.
             */
            autoRedirect: boolean;
        };

        /**
         * An object representing the site's supported languages.
         */
        type GeneralInfoLanguagesSupported = {
            /**
             * Language code.
             */
            languageCode: string;
            /**
             * Language locale.
             */
            locale: wix_site_backend.generalInfo.GeneralInfoLocale;
            /**
             * Country Code for the Language icon.
             */
            countryCode: string;
            /**
             * Whether the language is the primary language.
             */
            isPrimary: boolean;
        };

        /**
         * An object representing a site's locale.
         */
        type GeneralInfoLocale = {
            /**
             * Site country.
             */
            country: string;
            /**
             * Site language code.
             */
            languageCode: string;
        };

        /**
         * An object representing business hours.
         */
        type GeneralInfoSchedule = {
            /**
             * List of opening and closing days and times.
             */
            periods: [wix_site_backend.generalInfo.GeneralInfoSchedulePeriods];
            /**
             * Special hours.
             */
            specialHourPeriod: [wix_site_backend.generalInfo.GeneralInfoScheduleSpecial];
        };

        /**
         * An object representing business opened and closed hours.
         */
        type GeneralInfoSchedulePeriods = {
            /**
             * Business opening day.
             */
            openDay: string;
            /**
             * Business opening time.
             */
            openTime: string;
            /**
             * Business closing day.
             */
            closeDay: string;
            /**
             * Business closing time.
             */
            closeTime: string;
        };

        /**
         * An object representing special business hours.
         */
        type GeneralInfoScheduleSpecial = {
            /**
             * Special hours start date.
             */
            startDate: string;
            /**
             * Special hours end date.
             */
            endDate: string;
            /**
             * Whether the business is closed.
             */
            isClosed: boolean;
            /**
             * Special hours comment.
             */
            comment: string;
        };

    }

}

declare namespace wix_stores_backend {
    /**
     * Events that are fired from a Wix Store.
     */
    interface Events {
        /**
         * An event that fires when a visitor abandons a shopping cart.
         */
        onCartAbandoned(event: wix_stores_backend.Events.CartAbandonedEvent): void;
        /**
         * An event that fires when a visitor completes a purchase from a shopping cart.
         */
        onCartCompleted(event: wix_stores_backend.Events.CartCompletedEvent): void;
        /**
         * An event that fires when a visitor adds a product to a shopping cart.
         */
        onCartCreated(event: wix_stores_backend.Events.CartCreatedEvent): void;
        /**
         * An event that fires when a visitor completes a purchase from an abandoned shopping cart.
         */
        onCartRecovered(event: wix_stores_backend.Events.CartRecoveredEvent): void;
        /**
         * An event that fires when a new order is placed.
         */
        onNewOrder(event: wix_stores_backend.Events.NewOrderEvent): void;
    }

    namespace Events {
        /**
         * An object representing a shopping cart that was abandoned.
         */
        type CartAbandonedEvent = {
            /**
             * Time the abandoned cart was abandoned.
             */
            abandonTime: Date;
            /**
             * Unique identifier of the shopping cart that was abandoned.
             */
            cartId: string;
            /**
             * URL of the abandoned cart's checkout page.
             */
            checkoutUrl: string;
            /**
             * Unique identity of coupon used in the abandoned cart.
             */
            couponId: string;
            /**
             * Time the abandoned cart was created.
             */
            creationTime: Date;
            /**
             * Information about the vistor who abandoned the shopping cart.
             */
            buyerInfo: wix_stores_backend.BuyerInfo;
            /**
             * Number of items in the abandoned cart.
             */
            itemsCount: number;
            /**
             * Abandoned cart totals.
             */
            totals: wix_stores_backend.Events.CartTotals;
        };

        /**
         * An object representing a shopping cart that was completed.
         */
        type CartCompletedEvent = {
            /**
             * Unique identifier of the shopping cart that was completed.
             */
            cartId: string;
            /**
             * Time the shopping cart was completed.
             */
            completedTime: Date;
            /**
             * The buyer's information.
             */
            buyerInfo: wix_stores_backend.BuyerInfo;
            /**
             * Message from the buyer.
             */
            buyerNote: string;
            /**
             * Coupon applied in the shopping cart.
             */
            appliedCoupon: wix_stores_backend.AppliedCoupon;
            /**
             * Billing address.
             */
            billingAddress: wix_stores_backend.Address;
            /**
             * Currency of the shopping cart.
             */
            currency: wix_stores_backend.Currency;
            /**
             * The order's units of weight. One of: `"KG"`, `"LB"`, or `"UNSPECIFIED_WEIGHT_UNIT"`.
             */
            weightUnit: string;
            /**
             * The shopping cart's totals.
             */
            totals: wix_stores_backend.OrderTotals;
            /**
             * The shopping cart's shipping information.
             */
            shippingInfo: wix_stores_backend.ShippingInfo;
        };

        /**
         * An object representing a shopping cart that was created.
         */
        type CartCreatedEvent = {
            /**
             * Unique identifier of the shopping cart that was created.
             */
            cartId: string;
            /**
             * The buyer's information.
             */
            buyerInfo: wix_stores_backend.BuyerInfo;
            /**
             * Time the shopping cart was created.
             */
            creationTime: Date;
            /**
             * The order's units of weight. One of: `"KG"`, `"LB"`, or `"UNSPECIFIED_WEIGHT_UNIT"`.
             */
            weightUnit: string;
            /**
             * Currency of the shopping cart.
             */
            currency: wix_stores_backend.Currency;
            /**
             * The shopping cart's totals.
             */
            totals: wix_stores_backend.OrderTotals;
        };

        /**
         * An object representing a shopping cart that was recovered.
         */
        type CartRecoveredEvent = {
            /**
             * Time the recovered cart was abandoned.
             */
            abandonedTime: Date;
            /**
             * Unique identifier of the shopping cart that was abandoned.
             */
            cartId: string;
            /**
             * Time the cart was recovered.
             */
            recoveredTime: Date;
            /**
             * Time the recovered cart was originally created.
             */
            creationTime: Date;
        };

        /**
         * An object representing the totals of a shopping cart.
         */
        type CartTotals = {
            /**
             * Subtotal of all the line items in the abandoned cart, not including shipping and tax.
             */
            subtotal: number;
            /**
             * Total of all the line items in the abandoned cart, including shipping and tax.
             */
            total: number;
            /**
             * Total formatted with currency symbol.
             */
            formattedTotal: string;
        };

        /**
         * An object representing a new order from a store.
         */
        type NewOrderEvent = {
            /**
             * The ID of the order, auto-generated when an order is created an unique within all Wix Stores.
             */
            orderId: string;
            /**
             * Running order number unique to the current store.
             */
            number: string;
            /**
             * The buyer's information.
             */
            buyerInfo: wix_stores_backend.BuyerInfo;
            /**
             * The currency code for all of the order's prices.
             */
            currency: string;
            /**
             * The order's units of weight. One of: `"KG"`, `"LB"`, or `"UNSPECIFIED_WEIGHT_UNIT"`.
             */
            weightUnit: string;
            /**
             * The order's totals.
             */
            totals: wix_stores_backend.OrderTotals;
            /**
             * The order's payment status. One of: `"PAID"` or `"NOT_PAID"`.
             */
            paymentStatus: string;
            /**
             * The order's fulfillment status. One of: `"FULFILLED"` or `"NOT_FULFILLED"`.
             */
            fulfillmentStatus: string;
            /**
             * The date the order was created.
             */
            dateCreated: Date;
        };

    }

    /**
     * An object representing an address.
     */
    type Address = {
        /**
         * First name.
         */
        firstName: string;
        /**
         * Last name.
         */
        lastName: string;
        /**
         * Email address.
         */
        email: string;
        /**
         * Phone number.
         */
        phone: string;
        /**
         * Address.
         */
        address: string;
    };

    /**
     * An object representing a coupon applied in a shopping cart.
     */
    type AppliedCoupon = {
        /**
         * Coupon code.
         */
        code: string;
        /**
         * Coupon unique identifier.
         */
        couponId: string;
        /**
         * Coupon name.
         */
        name: string;
        /**
         * Type of coupon.
         *  One of:
         * 
         *  + `"BuyXGetY"`
         *  + `"FixedPriceAmount"`
         *  + `"FreeShipping"`
         *  + `"MoneyOffAmount"`
         *  + `"PercentOffRate"`
         */
        couponType: string;
        /**
         * Value of the coupon discount.
         */
        discountValue: string;
    };

    /**
     * An object representing a visitor who abandoned a shopping cart.
     */
    type BuyerInfo = {
        /**
         * Buyer's unique ID.
         */
        id: string;
        /**
         * Buyer's email address.
         */
        email: string;
        /**
         * Buyer's first name.
         */
        firstName: string;
        /**
         * Buyer's last name.
         */
        lastName: string;
        /**
         * Buyer's identity.
         *  One of:
         * 
         *  + `"ADMIN"`: Buyer is the site owner.
         *  + `"MEMBER"`: Buyer is a logged-in site member.
         *  + `"VISITOR"`: Buyer is not logged in.
         *  + `"CONTACT"`: A contact has been created for the buyer.
         */
        identityType: string;
        /**
         * Buyer's phone number.
         */
        phone: string;
    };

    /**
     * An object representing a shopping cart.
     */
    type Cart = {
        /**
         * Unique identifier of the shopping cart.
         */
        id: string;
        /**
         * Coupon applied in the shopping cart.
         */
        appliedCoupon: wix_stores_backend.AppliedCoupon;
        /**
         * Cart billing address.
         */
        billingAddress: wix_stores_backend.Address;
        /**
         * The buyer's information.
         */
        buyerInfo: wix_stores_backend.BuyerInfo;
        /**
         * Cart status. Either `"INCOMPLETE"` or `"COMPLETE"`.
         */
        status: string;
        /**
         * Currency of the shopping cart.
         */
        currency: wix_stores_backend.Currency;
        /**
         * The shopping cart's shipping information.
         */
        shippingInfo: wix_stores_backend.ShippingInfo;
        /**
         * Items in the shopping cart.
         */
        lineItems: [wix_stores_backend.LineItem];
        /**
         * The shopping cart's totals.
         */
        totals: wix_stores_backend.OrderTotals;
        /**
         * The order's units of weight. One of: `"KG"`, `"LB"`, or `"UNSPECIFIED_WEIGHT_UNIT"`.
         */
        weightUnit: string;
    };

    /**
     * An object representing a currency.
     */
    type Currency = {
        /**
         * The currency code.
         */
        currency: string;
        /**
         * The currency symbol.
         */
        symbol: string;
    };

    /**
     * An object representing a custom text field.
     */
    type CustomTextField = {
        /**
         * Field title.
         */
        title: string;
        /**
         * Field value.
         */
        value: string;
    };

    /**
     * An object representing a line item in a shopping cart.
     */
    type LineItem = {
        /**
         * Name of the line item.
         */
        name: string;
        /**
         * Notes about the line item.
         */
        notes: string;
        /**
         * Line item price.
         */
        price: string;
        /**
         * Line item product ID.
         */
        productId: string;
        /**
         * Line item quantity.
         */
        quantity: number;
        /**
         * Line item stock keeping unit.
         */
        sku: string;
        /**
         * Total price charged to the customer for all line items after any applicable discounts.
         */
        totalPrice: string;
        /**
         * Line item weight.
         */
        weight: string;
        /**
         * Type of the line item.
         *  One of:
         * 
         *  + `"DIGITAL"`: Digital item.
         *  + `"PHYSICAL"`: Physical item.
         *  + `"CUSTOM_AMOUNT_ITEM"`: Item with a custom price.
         *  + `"UNSPECIFIED"`: Type can't be classified due to an error.
         */
        lineItemType: string;
        /**
         * Line item options.
         */
        options: [wix_stores_backend.Option];
        /**
         * Media item.
         */
        mediaItem: wix_stores_backend.MediaItem;
        /**
         * Custom text.
         */
        customTextFields: [wix_stores_backend.CustomTextField];
    };

    /**
     * An object representing a media item.
     */
    type MediaItem = {
        /**
         * Type of the media item.
         *  One of:
         * 
         *  + `"IMAGE"`: Image item.
         *  + `"UNSPECIFIED_MEDIA_TYPE_ITEM"`: Media item type can't be classified due to an error.
         */
        mediaType: string;
        /**
         * Media item URL.
         */
        url: string;
        /**
         * Media item height.
         */
        height: number;
        /**
         * Media item width.
         */
        width: number;
    };

    /**
     * An object representing a line item option.
     */
    type Option = {
        /**
         * Name of the product option.
         */
        option: string;
        /**
         * Selected option.
         */
        selection: string;
    };

    /**
     * An object representing an order's totals.
     */
    type OrderTotals = {
        /**
         * The subtotal of all the order's line items, excluding tax.
         */
        subtotal: number;
        /**
         * The total shipping price, including tax.
         */
        shipping: number;
        /**
         * The total amount of tax.
         */
        tax: string;
        /**
         * The total calculated discount amount.
         */
        discount: number;
        /**
         * The total price.
         */
        total: number;
        /**
         * The total weight of the order's items.
         */
        weight: number;
        /**
         * The total quantity of the the order's line items.
         */
        quantity: number;
    };

    /**
     * An object returned by the `getProductOptionsAvailability()` function representing the availability of a product.
     */
    type ProductOptionsAvailability = {
        /**
         * Whether the product with the specified option choices is available for purchase.
         */
        availableForPurchase: boolean;
        /**
         * An object representing all the available options for a store product.
         */
        productOptions: $w.ProductPage.StoreProductOptions;
        /**
         * Main product media item (image or video) URL.
         */
        mainMedia: string;
        /**
         * List of product media items.
         */
        mediaItems: [$w.Gallery.ImageItem];
        /**
         * The variant of the product selected using the specified option choices if there is one.
         */
        selectedVariant: wix_stores_backend.ProductOptionsAvailabilitySelectedVariant;
    };

    /**
     * An object representing the product variant selected using the `getProductOptionsAvailability()` funtion.
     */
    type ProductOptionsAvailabilitySelectedVariant = {
        /**
         * Product variant stock keeping unit value.
         */
        sku: string;
        /**
         * Product variant currency.
         */
        currency: string;
        /**
         * Product variant price.
         */
        price: number;
        /**
         * Discounted product variant price.
         */
        discountedPrice: number;
        /**
         * Product variant price formatted with the currency.
         */
        formattedPrice: string;
        /**
         * Discounted product variant price formatted with the currency.
         */
        formattedDiscountedPrice: string;
        /**
         * Whether the product variant is shown in the store.
         */
        visible: boolean;
        /**
         * Whether the product variant is in stock.
         */
        inStock: boolean;
        /**
         * Product variant weight.
         */
        weight: number;
    };

    /**
     * An object representing shipping information.
     */
    type ShippingInfo = {
        /**
         * Shipment address.
         */
        shippingAddress?: wix_stores_backend.Address;
        /**
         * Pickup address.
         */
        pickupInfo?: wix_stores_backend.Address;
    };

    /**
     * An object representing the selection of specific choices from the product's options.
     */
    type StoreProductChoices = {
        /**
         * Value of the option. This key name is
         *  dependent on the options added to the product. For example, if a product
         *  has a size option, this key value will be something like "Size" and its value
         *  will be something like "Large".
         */
        optionKey: string;
    };

}

declare namespace wix_users_backend {
    /**
     * An object that contains information about the results of a site registration.
     */
    type RegistrationResult = {
        /**
         * Registration status. Either "Pending" or "Active".
         */
        status: string;
        /**
         * A token used to log in the current
         *  user as a site member. Pass the token from your backend code to client-side
         *  code and use it when calling the [applySessionToken()](wix-users.html#applySessionToken)
         *  function. The token is only available when `status` is "Active".
         */
        sessionToken?: string;
        /**
         * A token for approving the user as
         *  a site member using the [approveByToken()](wix-users-backend.html#approveByToken)
         *  function. The token is safe to pass via email or from client-side code to
         *  backend code. The token is only available when `status` is "Pending".
         */
        approvalToken?: string;
        /**
         * The user that has been registered.
         */
        user: wix_users.User;
    };

}

declare namespace wix_bookings {
    /**
     * An object used when calling [`getServiceAvailability()`](#getServiceAvailability)
     *  containing options for which slots should be returned.
     */
    type AvailabilityOptions = {
        /**
         * Start date and time of the slots
         *  to be returned. Defaults to the current date and time.
         */
        startDateTime?: Date;
        /**
         * End date and time of the slots to
         *  be returned. Defaults to one week from `startDateTime`, which is one week
         *  from the current date and time if `startDateTime` is also omitted.
         */
        endDateTime?: Date;
    };

    /**
     * An object used when calling [`checkoutBooking()`](#checkoutBooking)
     *  containing information about the slot to be booked.
     */
    type BookingInfo = {
        /**
         * The slot to be booked.
         */
        slot: wix_bookings.Slot;
        /**
         * Number of spots to book. Defaults to `1`.
         */
        numberOfSpots?: number;
        /**
         * List of form field values required to book the session.
         */
        formFields: [wix_bookings.FormField];
    };

    /**
     * An object representing the result of a call to [`checkoutBooking()`](#checkoutBooking).
     */
    type BookingResult = {
        /**
         * Status of the booking that was checked out.
         *  One of:
         * 
         *  + `"Confirmed"`: Payment was successful or payment is to be done offline.
         *  + `"Pending Payment"`: Payment is pending.
         *  + `"Terminated"`: Payment failed or was cancelled.
         */
        status: string;
        /**
         * ID of the booking that was checked out.
         */
        bookingId: string;
    };

    /**
     * An object used when calling [`checkoutBooking()`](#checkoutBooking)
     *  containing values for form fields required to book the session.
     */
    type FormField = {
        /**
         * Form field value.
         */
        value: string;
        /**
         * ID of the form field from the **form** property in the **Booking/Sessions** collection.
         */
        _id: string;
    };

    /**
     * An object used when calling [`checkoutBooking()`](#checkoutBooking)
     *  containing information about the payment options.
     */
    type PaymentOptions = {
        /**
         * Type of the payment. Either `"wixPay_Online"`
         *  for online collection, or `"wixPay_Offline"` for offline collection.
         */
        paymentType: string;
        /**
         * A coupon code to be used with the payment.
         */
        couponCode: string;
    };

    /**
     * An object returned from [`getServiceAvailability()`](#getServiceAvailability)
     *  containing the available bookings slots.
     */
    type ServiceAvailability = {
        /**
         * List of available slots.
         */
        slots: [wix_bookings.Slot];
    };

    /**
     * An object representing a booking slot.
     */
    type Slot = {
        /**
         * Starting date and time of the slot.
         */
        startDateTime: Date;
        /**
         * Ending date and time of the slot.
         */
        endDateTime: Date;
        /**
         * ID of the service that the slot belongs to.
         */
        serviceId: string;
        /**
         * Maximum number of participants that can book the service for this slot.
         */
        capacity: number;
        /**
         * Number of remaining spots that can be booked for the slot.
         */
        remainingSpots: number;
        /**
         * ID of the slot's staff member.
         */
        staffMemberId: string;
        /**
         * Unique slot identifier.
         */
        _id: string;
    };

}

declare namespace wix_crm {
    /**
     * An object that contains information about a site contact.
     */
    type ContactInfo = {
        /**
         * Contact's first name.
         */
        firstName: string;
        /**
         * Contact's last name.
         */
        lastName: string;
        /**
         * Contact's image source.
         */
        picture: string;
        /**
         * List of contact's email addresses.
         */
        emails: [string];
        /**
         * Email address the contact who is also
         *  a member uses to log into the system.
         */
        loginEmail: string;
        /**
         * List of contact's phone numbers.
         */
        phones: [string];
        /**
         * List of contact's labels. [Labels](https://support.wix.com/en/article/creating-contact-labels)
         *  are used to organize contacts. When setting the `labels` property, you can
         *  only list labels that already exist in your site's [Contacts List](https://support.wix.com/en/article/accessing-your-contact-list).
         */
        labels: [string];
        /**
         * Contact's language.
         */
        language: string;
        /**
         * Any
         *  number of custom fields. [Customs fields](https://support.wix.com/en/article/adding-custom-fields-to-contacts)
         *  are used to store additional information about your site's contacts. When
         *  setting a custom field, use key:value pairs where the key matches the names
         *  defined in your site's [Contacts List](https://support.wix.com/en/article/accessing-your-contact-list).
         *  You can only set values for custom fields that already exist in the Contacts
         *  application.
         */
        customFields: string;
    };

}

declare namespace wix_paid_plans_backend {
    /**
     * Events that are fired by actions relating to paid plans.
     */
    interface Events {
        /**
         * An event that fires when a user purchases a plan.
         */
        onPlanPurchased(event: wix_paid_plans_backend.Events.PlanPurchasedEvent): void;
    }

    namespace Events {
        /**
         * An object representing a new paid plan order.
         */
        type Order = {
            /**
             * Order ID of the purchase of the plan, auto-generated when an order is created.
             */
            id: string;
            /**
             * Status of the payment for the plan. Can be `PAID`, `REFUNDED`, `FAILED`, `UNPAID`, and `PAYMENT_STATUS_UNDEFINED`.
             */
            paymentStatus: string;
            /**
             * Object containing the price of the plan.
             */
            price: wix_paid_plans_backend.Events.Price;
            /**
             * If plan is cancelled, the reason why. Can be `OWNER_CANCELED`, `PAYMENT_PROVIDER_CANCELED`, `PAYMENT_FAILED`, `UOU_CANCELED`, and `CANCELLATION_REASON_UNDEFINED`.
             */
            cancellationReason: string;
            /**
             * Date and time from which the plan is valid.
             */
            validFrom: Date;
            /**
             * Name of the plan.
             */
            planName: string;
            /**
             * If the plan is recurring. If true, the price is deducted weekly, monthly, or yearly.
             */
            recurring: boolean;
            /**
             * Date and time the order was created.
             */
            dateCreated: Date;
            /**
             * Status of the order. Can be `ACTIVE`, `PENDING`, `CANCELED`, `EXPIRED`, `PENDING_CANCELLATION`, and `ORDER_STATUS_UNDEFINED`.
             */
            status: string;
            /**
             * Role assigned after purchasing the plan.
             */
            roleID: string;
            /**
             * Description of the plan.
             */
            planDescription: string;
            /**
             * ID for the visitor who purchased the plan.
             */
            memberId: string;
            /**
             * How the plan was purchased, either `ONLINE` pr `OFFLINE`.
             */
            orderType: string;
            /**
             * ID of the plan.
             */
            planId: string;
            /**
             * Object containing properties about how long the plan is valid.
             */
            validFor: wix_paid_plans_backend.Events.ValidFor;
            /**
             * ID of the plan for wix Pay. If plan is free, this ID is blank.
             */
            wixPayOrderId: string;
            /**
             * Date and time until which the plan is valid.
             */
            validUntil: Date;
        };

        /**
         * An object representing the period for which a plan is valid.
         */
        type Period = {
            /**
             * The number of units until the plan expires.
             */
            amount: number;
            /**
             * Time period for billing the plan, such as `MONTH`.
             */
            unit: string;
        };

        /**
         * An object representing a new paid plan purchase.
         */
        type PlanPurchasedEvent = {
            /**
             * Object containing the details about the plan's order.
             */
            order: wix_paid_plans_backend.Events.Order;
        };

        /**
         * An object representing the price of a purchased plan.
         */
        type Price = {
            /**
             * Payment currency. A three-letter
             *  [ISO-4217](https://en.wikipedia.org/wiki/ISO_4217) currency code.
             */
            currency: string;
            /**
             * The cost of the plan.
             */
            amount: number;
        };

        /**
         * An object representing how long a plan is valid.
         */
        type ValidFor = {
            /**
             * If true, the plan does not expire.
             */
            forever: boolean;
            /**
             * Object containing the period for which the plan is valid.
             */
            period: wix_paid_plans_backend.Events.Period;
        };

    }

}

declare namespace wix_paid_plans {
    /**
     * An object representing an order result.
     */
    type OrderResult = {
        /**
         * Status of the order, such as 200 if the order succeeded.
         */
        status: string;
        /**
         * ID of the order.
         */
        orderId: string;
        /**
         * Wix Pay ID of the order being purchased.
         */
        wixPayOrderId: string;
    };

    /**
     * An object representing IDs of an order result.
     */
    type OrderResultBody = {
        /**
         * ID of the cashier order.
         */
        cashierOrderId: string;
        /**
         * ID of the order.
         */
        orderId: string;
        /**
         * ID of the Wix Pay order.
         */
        wixPayOrderId: string;
    };

    /**
     * An object representing a purchase result for a non-free plan.
     */
    type PurchaseResult = {
        /**
         * Status of the purchase, such as 200 if the purchase succeeded.
         */
        status: string;
        /**
         * ID of the order being purchased.
         */
        orderId: string;
        /**
         * Wix Pay ID of the order being purchased. Returned for non-free plans.
         */
        wixPayOrderId: string;
    };

    /**
     * An object representing a purchase result for a free plan.
     */
    type PurchaseResultFree = {
        /**
         * ID of the order being purchased.
         */
        orderId: string;
        /**
         * Status of the purchase, such as 200 if the purchase succeeded.
         */
        status: string;
    };

}

declare namespace wix_pay {
    /**
     * An object representing a payment.
     */
    type Payment = {
        /**
         * Payment transaction ID.
         */
        id: string;
        /**
         * Payment total amount.
         */
        amount: number;
        /**
         * Payment currency. A three-letter
         *  [ISO-4217](https://en.wikipedia.org/wiki/ISO_4217) currency code.
         */
        currency: string;
        /**
         * Payment items.
         */
        items: [wix_pay.PaymentItem];
        /**
         * An object representing information about the user. It will be used to prefill
         *  the user info form during the payment process.
         */
        userInfo?: wix_pay_backend.PaymentUserInfo;
    };

    /**
     * An object representing a payment item.
     */
    type PaymentItem = {
        /**
         * Payment item name.
         */
        name: string;
        /**
         * Payment item quantity.
         */
        quantity: number;
        /**
         * Payment item price.
         */
        price: number;
    };

    /**
     * An object representing the options of a payment.
     */
    type PaymentOptions = {
        /**
         * Absolute URL of a terms and conditions
         *  page. If a link is present, an agreement checkbox will be presented alongside the link.
         */
        termsAndConditionsLink?: string;
        /**
         * Whether to show a thank you page. Defaults to `true`.
         */
        showThankYouPage?: boolean;
        /**
         * Deprecated: An object representing information about the user. It will be used to prefill
         *  user info form during payment process.
         * 
         *  Deprecation note: Pass user information to [`createPayment( )`](wix-pay-backend#createPayment) instead.
         */
        userInfo?: wix_pay.PaymentUserInfo;
        /**
         * Whether to skip the user info page. Defaults to `false`.
         *  The page will be skipped only if user info was passed to [`createPayment()`](wix-pay-backend.html#createPayment) as
         *  a part of the [`PaymentInfo`](wix-pay-backend.html#PaymentInfo) object.
         */
        skipUserInfoPage?: boolean;
    };

    /**
     * An object representing a payment result.
     */
    type PaymentResult = {
        /**
         * The payment.
         */
        payment: wix_pay.Payment;
        /**
         * Payment status. One of:
         * 
         *  + "`Successful`": Payment was successfully received.
         *  + "`Pending`": Payment is pending payment provider approval.
         *  + "`Failed`": Payment has failed.
         *  + "`Chargeback`": Payment is chargeback.
         *  + "`Refunded`": Payment was fully refunded.
         *  + "`Offline`": Payment will be executed offline.
         *  + "`PartiallyRefunded`": Payment was partially refunded.
         *  + "`Cancelled`": Payment was cancelled and was not processed.
         *  + "`Undefined`": Payment status is pending payment provider input.
         */
        status: string;
        /**
         * ID of the payment transaction.
         */
        transactionId: string;
    };

    /**
     * Deprecated: An object representing information about the user.
     */
    type PaymentUserInfo = {
        /**
         * User's first name. Value is `null` if
         *  there is no first name information.
         */
        firstName: string;
        /**
         * User's last name. Value is `null` if
         *  there is no last name information.
         */
        lastName: string;
        /**
         * User's country code. A three-letter
         *  [ISO-3166-1](https://en.wikipedia.org/wiki/ISO_3166-1) country code. Value
         *  is `null` if there is no country information.
         */
        country: string;
        /**
         * User's phone number. Value is `null` if
         *  there is no phone number information.
         */
        phone: string;
        /**
         * User's email address. Value is `null` if
         *  there is no email address information.
         */
        email: string;
    };

}

declare namespace wix_users {
    /**
     * A site user.
     */
    interface User {
        /**
         * Gets the user's ID.
         */
        readonly id: string;
        /**
         * Indicates whether the user is logged in or not.
         */
        readonly loggedIn: boolean;
        /**
         * Deprecated: Gets the user's role.
         */
        readonly role: string;
        /**
         * Gets the email of the current user.
         */
        getEmail(): Promise<string>;
        /**
         * Gets the user's member pricing plan.
         */
        getPricingPlans(): Promise<[wix_users.User.PricingPlan]>;
        /**
         * Gets the user's member roles.
         */
        getRoles(): Promise<[wix_users.User.UserRole]>;
    }

    namespace User {
        /**
         * An object returned by the `getPricingPlans()` function representing a user's pricing plans.
         */
        type PricingPlan = {
            /**
             * The pricing plan's name.
             */
            name: string;
            /**
             * The pricing plan's start date.
             */
            startDate?: Date;
            /**
             * The pricing plan's expiry date.
             */
            expiryDate?: Date;
        };

        /**
         * An object returned by the `getRoles()` function representing a user's roles.
         */
        type UserRole = {
            /**
             * Role name as defined in the site's dashboard or one of "Admin" or "Member".
             */
            name: string;
            /**
             * Role description, if defined in the site's dashboard.
             */
            description?: string;
        };

    }

    /**
     * An object used by the `promptLogin()` function to determine how the login dialog box appears.
     */
    type LoginOptions = {
        /**
         * What type of login experience to present: `"login"` or `"signup"`. Defaults to the option chosen in the Member Signup Settings panel in the Editor.
         */
        mode?: string;
        /**
         * The two letter language code of the language to show the login form in. Defaults to `"en"` if the property doesn't exist or the given language is not one of the languages found in the Permissions tab of the Page Settings panel in the Editor.
         */
        lang?: string;
    };

    /**
     * An object that contains information about a site registration.
     */
    type RegistrationOptions = {
        /**
         * Contact information.
         */
        contactInfo: wix_crm.ContactInfo;
    };

    /**
     * An object that contains information about the results of a site registration.
     */
    type RegistrationResult = {
        /**
         * Registration status. Either "Pending" or "Active".
         */
        status: string;
        /**
         * A token for approving the user as
         *  a site member using the [approveByToken()](wix-users-backend.html#approveByToken)
         *  function. The token is safe to pass via email or from client-side code to
         *  backend code. The token is only available when `status` is "Pending".
         */
        approvalToken?: string;
        /**
         * The user that has been registered.
         */
        user: wix_users.User;
    };

    /**
     * An object used when sending a Triggered Email.
     */
    type TriggeredEmailOptions = {
        /**
         * An object with `key:value` pairs where each
         *  `key` is a variable in the email template created in Triggered Emails and its
         *  corresponding `value` is the value to insert into the template in place of
         *  variable. The values must be strings.
         */
        variables: object;
    };

    /**
     * Function that runs when a user has logged in.
     */
    type LoginHandler = (user: wix_users.User)=>void;

}

