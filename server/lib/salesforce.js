import "dotenv/config";

const getSalesforceAccessToken = async () => {
  const clientId = process.env.SALESFORCE_CLIENT_ID;
  const clientSecret = process.env.SALESFORCE_CLIENT_SECRET;
  let loginUrl = process.env.SALESFORCE_INSTANCE_URL;
  
  if (!clientId || !clientSecret) {
    throw new Error('SALESFORCE_CLIENT_ID and SALESFORCE_CLIENT_SECRET are required');
  }
  
  if (!loginUrl) {
    throw new Error('SALESFORCE_LOGIN_URL or SALESFORCE_INSTANCE_URL must be set to your My Domain URL (e.g., MyDomainName.my.salesforce.com)');
  }
  
  const tokenUrl = `${loginUrl}/services/oauth2/token`;
  
  const headers = { "Content-Type": "application/x-www-form-urlencoded" };
  
  const requestBody = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId.trim(),
    client_secret: clientSecret.trim(),
  });
  
  try {
    const response = await fetch(tokenUrl, { method: "POST", headers, body: requestBody });
    const responseText = await response.text();
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { error_description: responseText };
      }
      throw new Error(`Salesforce authentication failed: ${errorData.error_description || errorData.error || responseText}`);
    }
    
    const data = JSON.parse(responseText);
    if (!data.access_token) {
      throw new Error('No access_token in response');
    }
    
    if (data.instance_url) {
      process.env.SALESFORCE_INSTANCE_URL = data.instance_url.replace(/\/$/, '');
    }
    
    return data.access_token.trim();
  } catch (error) {
    if (error.message.includes('Salesforce')) throw error;
    throw new Error(`Salesforce authentication error: ${error.message}`);
  }
};

export { getSalesforceAccessToken };

