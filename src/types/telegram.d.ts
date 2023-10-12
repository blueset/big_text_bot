export interface WebAppInitData {
    query_id?: string;
    user?: WebAppUser;
    receiver?: WebAppUser;
    chat?: WebAppChat;
    chat_type?: string;
    chat_instance?: string;
    start_param?: string;
    can_send_after?: number;
    auth_date: number;
    hash: string;
}

export interface WebAppUser {
    id: number;
    is_bot?: boolean;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    is_premium?: boolean;
    added_to_attachment_menu?: boolean;
    allows_write_to_pm?: boolean;
    photo_url?: string;
}

export interface WebAppChat {
    id: number;
    type: "group" | "supergroup" | "channel";
    title: string;
    username?: string;
    photo_url?: string;
}

export interface ThemeParams {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
}

export interface BackButton {
    isVisible: boolean;
    onClick(callback: () => void): this;
    offClick(callback: () => void): this;
    show(): this;
    hide(): this;
}

export interface MainButton {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    readonly isProgressVisible: boolean;
    setText(text: string): this;
    onClick(callback: () => void): this;
    offClick(callback: () => void): this;
    show(): this;
    hide(): this;
    enable(): this;
    disable(): this;
    showProgress(leaveActive?: boolean): this;
    hideProgress(): this;
    setParams(params: {
        text?: string;
        color?: string;
        text_color?: string;
        is_active?: boolean;
        is_visible?: boolean;
    }): this;
}

export interface HapticFeedback {
    impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): this;
    notificationOccurred(type: 'error' | 'success' | 'warning'): this;
    selectionChanged(): this;
}

export interface CloudStorage {
    setItem(key: string, value: string, callback?: (error: any, stored: boolean) => void): this;
    getItem(key: string, callback: (error: any, value: string) => void): this;
    getItems(keys: string[], callback: (error: any, values: { [key: string]: string }) => void): this;
    removeItem(key: string, callback?: (error: any, removed: boolean) => void): this;
    removeItems(keys: string[], callback?: (error: any, removed: boolean) => void): this;
    getKeys(callback: (error: any, keys: string[]) => void): this;
}

type ThemeChangedEventHandler = () => void;
type ViewportChangedEventHandler = (event: { isStateStable: boolean }) => void;
type MainButtonClickedEventHandler = () => void;
type BackButtonClickedEventHandler = () => void;
type SettingsButtonClickedEventHandler = () => void;
type InvoiceClosedEventHandler = (event: { url: string, status: 'paid' | 'cancelled' | 'failed' | 'pending' }) => void;
type PopupClosedEventHandler = (event: { button_id: string | null }) => void;
type QrTextReceivedEventHandler = (event: { data: string }) => void;
type ClipboardTextReceivedEventHandler = (event: { data: string | null | '' }) => void;
type WriteAccessRequestedEventHandler = (event: { status: 'allowed' | 'cancelled' }) => void;
type ContactRequestedEventHandler = (event: { status: 'sent' | 'cancelled' }) => void;

export interface ListenerControl {
    (eventType: 'themeChanged', eventHandler: ThemeChangedEventHandler): void;
    (eventType: 'viewportChanged', eventHandler: ViewportChangedEventHandler): void;
    (eventType: 'mainButtonClicked', eventHandler: MainButtonClickedEventHandler): void;
    (eventType: 'backButtonClicked', eventHandler: BackButtonClickedEventHandler): void;
    (eventType: 'settingsButtonClicked', eventHandler: SettingsButtonClickedEventHandler): void;
    (eventType: 'invoiceClosed', eventHandler: InvoiceClosedEventHandler): void;
    (eventType: 'popupClosed', eventHandler: PopupClosedEventHandler): void;
    (eventType: 'qrTextReceived', eventHandler: QrTextReceivedEventHandler): void;
    (eventType: 'clipboardTextReceived', eventHandler: ClipboardTextReceivedEventHandler): void;
    (eventType: 'writeAccessRequested', eventHandler: WriteAccessRequestedEventHandler): void;
    (eventType: 'contactRequested', eventHandler: ContactRequestedEventHandler): void;
}

export interface WebApp {
    initData: string;
    initDataUnsafe: WebAppInitData;
    version: string;
    platform: string;
    colorScheme: "light" | "dark";
    themeParams: ThemeParams;
    isExpanded: boolean;
    viewportHeight: number;
    viewportStableHeight: number;
    headerColor: string;
    backgroundColor: string;
    isClosingConfirmationEnabled: boolean;
    BackButton: BackButton;
    MainButton: MainButton;
    HapticFeedback: HapticFeedback;
    CloudStorage: CloudStorage;
    isVersionAtLeast(version: string): boolean;
    setHeaderColor(color: string): void;
    setBackgroundColor(color: string): void;
    enableClosingConfirmation(): void;
    disableClosingConfirmation(): void;
    onEvent: ListenerControl;
    offEvent: ListenerControl;
    sendData(data: string): void;
    switchInlineQuery(query: string, choose_chat_types?: string[]): void;
    openLink(url: string, options?: { try_instant_view?: boolean }): void;
    openTelegramLink(url: string): void;
    openInvoice(url: string, callback?: Function): void;
    showPopup(params: PopupParams, callback?: Function): void;
    showAlert(message: string, callback?: Function): void;
    showConfirm(message: string, callback?: Function): void;
    showScanQrPopup(params: ScanQrPopupParams, callback?: Function): void;
    closeScanQrPopup(): void;
    readTextFromClipboard(callback?: Function): void;
    requestWriteAccess(callback?: Function): void;
    requestContact(callback?: Function): void;
    ready(): void;
    expand(): void;
    close(): void;
}

declare global {
    interface Window {
        Telegram: {
            WebApp: WebApp;
        };
    }
}