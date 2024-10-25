export interface TixteResponse {
    success: boolean;
    size: number;
    data: {
        id: string;
        name: string;
        region: string;
        filename: string;
        extension: string;
        domain: string;
        type: number;
        expiration: string | null;
        permissions: Array<Record<string, any>>;
        url: string;
        direct_url: string;
        deletion_url: string;
        message: string;
    };
    message?: string;
    error?: {
        message: string;
    };
}
