import prisma from "../lib/prisma.js";
import { getSalesforceAccessToken, parseSalesforceToken } from "../getToken.js";

const createSalesforceAccount = async (accessToken, accountData) => {
  const token = parseSalesforceToken(accessToken);
  const tokenToUse = token.fullToken;
  const apiVersion = process.env.SALESFORCE_API_VERSION || "v58.0";
  const instanceUrl = process.env.SALESFORCE_INSTANCE_URL?.replace(/\/$/, '') || '';
  
  const response = await fetch(
    `${instanceUrl}/services/data/${apiVersion}/sobjects/Account/`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenToUse}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Name: accountData.companyName,
        Phone: accountData.phone || null,
        Industry: accountData.industry || null,
        BillingStreet: accountData.billingStreet || null,
        BillingCity: accountData.billingCity || null,
        BillingState: accountData.billingState || null,
        BillingPostalCode: accountData.billingPostalCode || null,
        BillingCountry: accountData.billingCountry || null,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create Account in Salesforce: ${errorText}`);
  }

  const data = await response.json();
  return data.id;
};

const createSalesforceContact = async (accessToken, contactData, accountId, userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const token = parseSalesforceToken(accessToken);
  const tokenToUse = token.fullToken;
  const apiVersion = process.env.SALESFORCE_API_VERSION || "v58.0";
  const instanceUrl = process.env.SALESFORCE_INSTANCE_URL?.replace(/\/$/, '') || '';
  
  const response = await fetch(
    `${instanceUrl}/services/data/${apiVersion}/sobjects/Contact/`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenToUse}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        FirstName: user.name?.split(" ")[0] || null,
        LastName: user.name?.split(" ").slice(1).join(" ") || user.name || "User",
        Email: user.email,
        Phone: contactData.phone || null,
        Title: contactData.jobTitle || null,
        Department: contactData.department || null,
        AccountId: accountId,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create Contact in Salesforce: ${errorText}`);
  }

  const data = await response.json();
  return data.id;
};

export const describeSObject = async (req, res) => {
  try {
    const { sobjectName } = req.params;

    if (!sobjectName) {
      return res.status(400).json({ error: "SObject name is required" });
    }

    if (!process.env.SALESFORCE_INSTANCE_URL || 
        !process.env.SALESFORCE_CLIENT_ID || 
        !process.env.SALESFORCE_CLIENT_SECRET ||
        !process.env.SALESFORCE_USERNAME ||
        !process.env.SALESFORCE_PASSWORD) {
      return res.status(500).json({ 
        error: "Salesforce configuration is missing. Please check environment variables." 
      });
    }

    const accessToken = await getSalesforceAccessToken();
    const token = parseSalesforceToken(accessToken);
    const tokenToUse = token.fullToken;
    const apiVersion = process.env.SALESFORCE_API_VERSION || "v58.0";
    const instanceUrl = process.env.SALESFORCE_INSTANCE_URL?.replace(/\/$/, '') || '';

    const response = await fetch(
      `${instanceUrl}/services/data/${apiVersion}/sobjects/${sobjectName}/describe`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${tokenToUse}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to describe ${sobjectName}: ${errorText}`);
    }

    const data = await response.json();
    res.json({
      success: true,
      sobjectName,
      metadata: data,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message || `Failed to describe ${req.params.sobjectName}`,
    });
  }
};

export const createAccountAndContact = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      companyName,
      phone,
      industry,
      billingStreet,
      billingCity,
      billingState,
      billingPostalCode,
      billingCountry,
      jobTitle,
      department,
    } = req.body;

    if (!companyName) {
      return res.status(400).json({ error: "Company name is required" });
    }

    if (!process.env.SALESFORCE_INSTANCE_URL || 
        !process.env.SALESFORCE_CLIENT_ID || 
        !process.env.SALESFORCE_CLIENT_SECRET ||
        !process.env.SALESFORCE_USERNAME ||
        !process.env.SALESFORCE_PASSWORD) {
      return res.status(500).json({ 
        error: "Salesforce configuration is missing. Please check environment variables. Required: SALESFORCE_INSTANCE_URL, SALESFORCE_CLIENT_ID, SALESFORCE_CLIENT_SECRET, SALESFORCE_USERNAME, SALESFORCE_PASSWORD. Optional: SALESFORCE_SECURITY_TOKEN" 
      });
    }

    const accessToken = await getSalesforceAccessToken();

    const accountData = {
      companyName,
      phone,
      industry,
      billingStreet,
      billingCity,
      billingState,
      billingPostalCode,
      billingCountry,
    };

    const accountId = await createSalesforceAccount(accessToken, accountData);
    const contactId = await createSalesforceContact(
      accessToken,
      { phone, jobTitle, department },
      accountId,
      userId
    );

    res.json({
      success: true,
      accountId,
      contactId,
      message: "Account and Contact created successfully in Salesforce",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message || "Failed to create Salesforce account and contact",
    });
  }
};
