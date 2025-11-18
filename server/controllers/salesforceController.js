import prisma from "../lib/prisma.js";
import { getSalesforceAccessToken } from "../lib/salesforce.js";

let instanceUrl = process.env.SALESFORCE_INSTANCE_URL?.trim() || '';

const getApiHeaders = (accessToken) => {
  if (!accessToken || typeof accessToken !== 'string') {
    throw new Error("Invalid Salesforce access token");
  }
  return {
    Authorization: `Bearer ${accessToken.trim()}`,
    "Content-Type": "application/json",
  };
};

const handleSalesforceError = async (response, defaultMessage) => {
  const errorText = await response.text();
  try {
    const errorData = JSON.parse(errorText);
    if (errorData.message) {
      if (errorData.message.includes('Use one of these records') || errorData.message.includes('duplicate')) {
        return `A contact with this email already exists in Salesforce. ${errorData.message}`;
      }
      return errorData.message;
    }
    if (Array.isArray(errorData) && errorData.length > 0) {
      const errors = errorData.map(e => {
        if (e.message?.includes('Use one of these records') || e.message?.includes('duplicate')) {
          return `A contact with this email already exists. ${e.message}`;
        }
        return e.message || e.errorCode;
      });
      return errors.join('; ');
    }
  } catch {}
  return errorText || defaultMessage;
};

const findSalesforceAccountByName = async (accessToken, companyName) => {
  const apiVersion = process.env.SALESFORCE_API_VERSION || "v62.0";
  const headers = getApiHeaders(accessToken);
  
  const name = companyName.trim();
  const escapedName = name.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const query = `SELECT Id, Name FROM Account WHERE Name = '${escapedName}' LIMIT 1`;
  const queryUrl = `${instanceUrl}/services/data/${apiVersion}/query?q=${encodeURIComponent(query)}`;
  
  const response = await fetch(queryUrl, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  if (data.records && data.records.length > 0) {
    return data.records[0].Id;
  }
  return null;
};

const createSalesforceAccount = async (accessToken, accountData) => {
  const apiVersion = process.env.SALESFORCE_API_VERSION || "v62.0";
  const headers = getApiHeaders(accessToken);
  
  const existingAccountId = await findSalesforceAccountByName(accessToken, accountData.companyName);
  
  const payload = {};
  if (accountData.phone) payload.Phone = accountData.phone;
  if (accountData.industry) payload.Industry = accountData.industry;
  if (accountData.description) payload.Description = accountData.description;
  if (accountData.website) {
    payload.Website = accountData.website;
    payload.Site = accountData.website;
  }
  if (accountData.numberOfEmployees) payload.NumberOfEmployees = accountData.numberOfEmployees;
  
  if (existingAccountId) {
    const response = await fetch(`${instanceUrl}/services/data/${apiVersion}/sobjects/Account/${existingAccountId}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(await handleSalesforceError(response, `Failed to update existing Account (${response.status})`));
    }
    return existingAccountId;
  }
  
  payload.Name = accountData.companyName;
  const response = await fetch(`${instanceUrl}/services/data/${apiVersion}/sobjects/Account/`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await handleSalesforceError(response, `Failed to create Account (${response.status})`));
  }

  const data = await response.json();
  if (!data.id) throw new Error("Salesforce returned success but no account ID");
  return data.id;
};

const createSalesforceContact = async (accessToken, contactData, accountId, userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });

  if (!user?.email) throw new Error("User not found or email is required");

  const apiVersion = process.env.SALESFORCE_API_VERSION || "v62.0";
  const headers = getApiHeaders(accessToken);
  
  const nameParts = user.name?.split(" ").filter(Boolean) || [];
  const payload = {
    FirstName: nameParts[0] || "User",
    LastName: nameParts.slice(1).join(" ") || "Contact",
    Email: user.email,
    AccountId: accountId,
  };
  
  if (contactData.phone) payload.Phone = contactData.phone;
  if (contactData.jobTitle) payload.Title = contactData.jobTitle;
  if (contactData.department) payload.Department = contactData.department;
  
  const response = await fetch(`${instanceUrl}/services/data/${apiVersion}/sobjects/Contact/`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await handleSalesforceError(response, `Failed to create Contact (${response.status})`));
  }

  const data = await response.json();
  if (!data.id) throw new Error("Salesforce returned success but no contact ID");
  return data.id;
};

const updateSalesforceAccount = async (accessToken, accountId, accountData) => {
  const apiVersion = process.env.SALESFORCE_API_VERSION || "v62.0";
  const headers = getApiHeaders(accessToken);
  
  const payload = {};
  if (accountData.companyName) payload.Name = accountData.companyName;
  if (accountData.phone !== undefined) payload.Phone = accountData.phone || null;
  if (accountData.industry !== undefined) payload.Industry = accountData.industry || null;
  if (accountData.description !== undefined) payload.Description = accountData.description || null;
  if (accountData.website !== undefined) {
    payload.Website = accountData.website || null;
    payload.Site = accountData.website || null;
  }
  if (accountData.numberOfEmployees !== undefined) payload.NumberOfEmployees = accountData.numberOfEmployees || null;
  
  const response = await fetch(`${instanceUrl}/services/data/${apiVersion}/sobjects/Account/${accountId}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await handleSalesforceError(response, `Failed to update Account (${response.status})`));
  }

  return true;
};

const updateSalesforceContact = async (accessToken, contactId, contactData) => {
  const apiVersion = process.env.SALESFORCE_API_VERSION || "v62.0";
  const headers = getApiHeaders(accessToken);
  
  const payload = {};
  if (contactData.phone !== undefined) payload.Phone = contactData.phone || null;
  if (contactData.jobTitle !== undefined) payload.Title = contactData.jobTitle || null;
  if (contactData.department !== undefined) payload.Department = contactData.department || null;
  
  const response = await fetch(`${instanceUrl}/services/data/${apiVersion}/sobjects/Contact/${contactId}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await handleSalesforceError(response, `Failed to update Contact (${response.status})`));
  }

  return true;
};

const getSalesforceAccountData = async (accessToken, accountId) => {
  const apiVersion = process.env.SALESFORCE_API_VERSION || "v62.0";
  const headers = getApiHeaders(accessToken);
  
  const response = await fetch(`${instanceUrl}/services/data/${apiVersion}/sobjects/Account/${accountId}`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error(await handleSalesforceError(response, `Failed to get Account (${response.status})`));
  }

  const data = await response.json();
  return {
    companyName: data.Name,
    phone: data.Phone,
    industry: data.Industry,
    description: data.Description,
    website: data.Website,
    numberOfEmployees: data.NumberOfEmployees,
  };
};

const getSalesforceContactData = async (accessToken, contactId) => {
  const apiVersion = process.env.SALESFORCE_API_VERSION || "v62.0";
  const headers = getApiHeaders(accessToken);
  
  const response = await fetch(`${instanceUrl}/services/data/${apiVersion}/sobjects/Contact/${contactId}`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error(await handleSalesforceError(response, `Failed to get Contact (${response.status})`));
  }

  const data = await response.json();
  return {
    phone: data.Phone,
    jobTitle: data.Title,
    department: data.Department,
  };
};

export const getSalesforceData = async (req, res) => {
  try {
    const authenticatedUserId = req.user?.id;
    const authenticatedUserRole = req.user?.role;
    if (!authenticatedUserId) return res.status(401).json({ error: "User authentication required" });

    const targetUserId = req.query.userId || authenticatedUserId;

    if (targetUserId !== authenticatedUserId && authenticatedUserRole !== 'ADMIN') {
      return res.status(403).json({ error: "Only admins can fetch other users' Salesforce data" });
    }

    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { salesforceAccountId: true, salesforceContactId: true },
    });

    if (!user?.salesforceAccountId) {
      return res.status(404).json({ error: "No Salesforce connection found" });
    }

    if (!process.env.SALESFORCE_CLIENT_ID || !process.env.SALESFORCE_CLIENT_SECRET) {
      return res.status(500).json({ error: "Salesforce configuration is missing" });
    }

    const accessToken = await getSalesforceAccessToken();
    const accountData = await getSalesforceAccountData(accessToken, user.salesforceAccountId);
    const contactData = await getSalesforceContactData(accessToken, user.salesforceContactId);

    res.json({
      success: true,
      accountId: user.salesforceAccountId,
      contactId: user.salesforceContactId,
      ...accountData,
      ...contactData,
    });
  } catch (error) {
    console.error("Salesforce get data error:", error);
    res.status(500).json({ error: error.message || "Failed to get Salesforce data" });
  }
};

export const updateAccountAndContact = async (req, res) => {
  try {
    const authenticatedUserId = req.user?.id;
    const authenticatedUserRole = req.user?.role;
    if (!authenticatedUserId) return res.status(401).json({ error: "User authentication required" });

    const targetUserId = req.query.userId || req.body.userId || authenticatedUserId;

    if (targetUserId !== authenticatedUserId && authenticatedUserRole !== 'ADMIN') {
      return res.status(403).json({ error: "Only admins can update other users' Salesforce data" });
    }

    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { salesforceAccountId: true, salesforceContactId: true },
    });

    if (!user?.salesforceAccountId) {
      return res.status(404).json({ error: "No Salesforce connection found. Please create one first." });
    }

    const { companyName, phone, industry, description, website, numberOfEmployees, jobTitle, department } = req.body;

    if (!process.env.SALESFORCE_CLIENT_ID || !process.env.SALESFORCE_CLIENT_SECRET) {
      return res.status(500).json({ error: "Salesforce configuration is missing" });
    }

    const accessToken = await getSalesforceAccessToken();
    
    const accountData = {
      companyName: companyName?.trim(),
      phone: phone?.trim(),
      industry: industry?.trim(),
      description: description?.trim(),
      website: website?.trim(),
      numberOfEmployees: numberOfEmployees ? parseInt(numberOfEmployees) : undefined,
    };

    await updateSalesforceAccount(accessToken, user.salesforceAccountId, accountData);

    const contactData = {
      phone: phone?.trim(),
      jobTitle: jobTitle?.trim(),
      department: department?.trim(),
    };

    await updateSalesforceContact(accessToken, user.salesforceContactId, contactData);

    res.json({
      success: true,
      accountId: user.salesforceAccountId,
      contactId: user.salesforceContactId,
      message: "Salesforce account and contact updated successfully",
    });
  } catch (error) {
    console.error("Salesforce update error:", error);
    res.status(500).json({ error: error.message || "Failed to update Salesforce account and contact" });
  }
};

export const createAccountAndContact = async (req, res) => {
  try {
    const authenticatedUserId = req.user?.id;
    const authenticatedUserRole = req.user?.role;
    if (!authenticatedUserId) return res.status(401).json({ error: "User authentication required" });

    const targetUserId = req.query.userId || req.body.userId || authenticatedUserId;

    if (targetUserId !== authenticatedUserId && authenticatedUserRole !== 'ADMIN') {
      return res.status(403).json({ error: "Only admins can create Salesforce accounts for other users" });
    }

    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { salesforceAccountId: true, salesforceContactId: true },
    });

    if (user?.salesforceContactId) {
      return res.status(400).json({ 
        error: "This user already has a Salesforce contact linked. Contact ID: " + user.salesforceContactId 
      });
    }

    const { companyName, phone, industry, description, website, numberOfEmployees, jobTitle, department } = req.body;
    if (!companyName?.trim()) return res.status(400).json({ error: "Company name is required" });

    if (!process.env.SALESFORCE_CLIENT_ID || !process.env.SALESFORCE_CLIENT_SECRET) {
      return res.status(500).json({ error: "Salesforce configuration is missing" });
    }

    const accessToken = await getSalesforceAccessToken();
    
    const accountData = {
      companyName: companyName.trim(),
      phone: phone?.trim(),
      industry: industry?.trim(),
      description: description?.trim(),
      website: website?.trim(),
      numberOfEmployees: numberOfEmployees ? parseInt(numberOfEmployees) : undefined,
    };

    const accountId = await createSalesforceAccount(accessToken, accountData);
    if (!accountId) throw new Error("Failed to create Salesforce account");

    const contactId = await createSalesforceContact(
      accessToken,
      { phone: phone?.trim(), jobTitle: jobTitle?.trim(), department: department?.trim() },
      accountId,
      targetUserId
    );

    if (!contactId) throw new Error("Failed to create Salesforce contact");

    await prisma.user.update({
      where: { id: targetUserId },
      data: {
        salesforceAccountId: accountId,
        salesforceContactId: contactId,
      },
    });

    res.json({
      success: true,
      accountId,
      contactId,
      message: "Account and Contact created successfully in Salesforce",
    });
  } catch (error) {
    console.error("Salesforce integration error:", error);
    res.status(500).json({ error: error.message || "Failed to create Salesforce account and contact" });
  }
};
