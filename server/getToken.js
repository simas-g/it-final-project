import "dotenv/config";

const parseSalesforceToken = (token) => {
  if (!token) return null;
  
  if (token.includes('!')) {
    const [orgId, accessToken] = token.split('!');
    return {
      orgId,
      accessToken,
      fullToken: token
    };
  }
  
  return {
    orgId: null,
    accessToken: token,
    fullToken: token
  };
};

const getSalesforceAccessToken = async () => {
  let instanceUrl = process.env.SALESFORCE_INSTANCE_URL;
  const clientId = process.env.SALESFORCE_CLIENT_ID;
  const clientSecret = process.env.SALESFORCE_CLIENT_SECRET;
  const username = process.env.SALESFORCE_USERNAME;
  const password = process.env.SALESFORCE_PASSWORD;
  const securityToken = process.env.SALESFORCE_SECURITY_TOKEN;
  
  if (!instanceUrl) {
    throw new Error('SALESFORCE_INSTANCE_URL is not set');
  }
  
  if (!clientId || !clientSecret || !username || !password) {
    throw new Error('SALESFORCE_CLIENT_ID, SALESFORCE_CLIENT_SECRET, SALESFORCE_USERNAME, and SALESFORCE_PASSWORD are required for Password grant flow');
  }
  
  instanceUrl = instanceUrl.trim();
  
  if (!instanceUrl.startsWith('http://') && !instanceUrl.startsWith('https://')) {
    instanceUrl = `https://${instanceUrl}`;
  }
  
  if (instanceUrl.startsWith('http://')) {
    instanceUrl = instanceUrl.replace('http://', 'https://');
  }
  
  instanceUrl = instanceUrl.replace(/\/$/, '');
  
  const tokenUrl = `${instanceUrl}/services/oauth2/token`;
  
  const fullPassword = password + (securityToken || '');
  
  try {
    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "password",
        client_id: clientId,
        client_secret: clientSecret,
        username: username,
        password: fullPassword,
      }),
    });
    
    const responseText = await response.text();
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { error: 'unknown', error_description: responseText };
      }
      
      if (errorData.error === 'invalid_grant') {
        const errorDesc = errorData.error_description || 'authentication failure';
        throw new Error(`Salesforce authentication failed: ${errorDesc}`);
      }
      
      if (errorData.error === 'invalid_client_id') {
        throw new Error(`Invalid Client ID: ${responseText}`);
      }
      
      if (errorData.error === 'invalid_client') {
        throw new Error(`Invalid Client ID or Secret: ${responseText}`);
      }
      
      if (errorData.error === 'invalid_request') {
        throw new Error(`Invalid request: ${responseText}`);
      }
      
      throw new Error(`Salesforce authentication failed (${response.status}): ${responseText}`);
    }

    const data = JSON.parse(responseText);
    const token = data.access_token;
    
    if (!token) {
      throw new Error('No access_token in response. Response: ' + responseText);
    }
    
    const parsed = parseSalesforceToken(token);
    
    return parsed.fullToken;
  } catch (error) {
    if (error.code === 'ENOTFOUND' || error.message.includes('getaddrinfo')) {
      throw new Error(`Cannot resolve Salesforce instance URL: ${instanceUrl}`);
    }
    
    if (error.code === 'ECONNREFUSED') {
      throw new Error(`Connection refused to Salesforce instance: ${instanceUrl}`);
    }
    
    if (error.message.includes('Salesforce')) {
      throw error;
    }
    
    throw new Error(`Unexpected error during Salesforce authentication: ${error.message}`);
  }
};

export { getSalesforceAccessToken, parseSalesforceToken };
