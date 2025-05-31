export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateProjectTitle = (title: string): ValidationResult => {
  if (!title || !title.trim()) {
    return { isValid: false, error: "Title is required" };
  }
  if (title.length > 255) {
    return { isValid: false, error: "Title must be less than 255 characters" };
  }
  return { isValid: true };
};

export const validateDescription = (description: string): ValidationResult => {
  if (description && description.length > 1000) {
    return { isValid: false, error: "Description must be less than 1000 characters" };
  }
  return { isValid: true };
};

export const validateUrl = (url: string): ValidationResult => {
  if (!url.trim()) {
    return { isValid: true }; // URL is optional
  }
  
  try {
    const urlObj = new URL(url);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { isValid: false, error: "URL must use http or https protocol" };
    }
    return { isValid: true };
  } catch {
    return { isValid: false, error: "Please enter a valid URL (e.g., https://example.com)" };
  }
};

export const validateEmail = (email: string): ValidationResult => {
  if (!email.trim()) {
    return { isValid: false, error: "Email is required" };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: "Please enter a valid email address" };
  }
  
  return { isValid: true };
};

export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, error: "Password is required" };
  }
  if (password.length < 8) {
    return { isValid: false, error: "Password must be at least 8 characters long" };
  }
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return { isValid: false, error: "Password must contain uppercase, lowercase, and number" };
  }
  return { isValid: true };
};

export const validateSitemapData = (data: any): ValidationResult => {
  if (!data || typeof data !== 'object') {
    return { isValid: false, error: "Invalid sitemap data format" };
  }
  if (!Array.isArray(data.nodes)) {
    return { isValid: false, error: "Sitemap must have a nodes array" };
  }
  if (!Array.isArray(data.edges)) {
    return { isValid: false, error: "Sitemap must have an edges array" };
  }
  
  // Validate node structure
  for (const node of data.nodes) {
    if (!node.id || !node.type || !node.position) {
      return { isValid: false, error: "All nodes must have id, type, and position" };
    }
  }
  
  // Validate edge structure
  for (const edge of data.edges) {
    if (!edge.id || !edge.source || !edge.target) {
      return { isValid: false, error: "All edges must have id, source, and target" };
    }
  }
  
  return { isValid: true };
};

export const validateProject = (project: {
  title?: string;
  description?: string;
  sitemap_data?: any;
}): ValidationResult => {
  // Only validate title if it's provided
  if (project.title !== undefined) {
    const titleValidation = validateProjectTitle(project.title);
    if (!titleValidation.isValid) return titleValidation;
  }
  
  // Only validate description if it's provided
  if (project.description !== undefined) {
    const descValidation = validateDescription(project.description);
    if (!descValidation.isValid) return descValidation;
  }
  
  // Only validate sitemap data if it's provided
  if (project.sitemap_data !== undefined) {
    const sitemapValidation = validateSitemapData(project.sitemap_data);
    if (!sitemapValidation.isValid) return sitemapValidation;
  }
  
  return { isValid: true };
};

export const getValidationErrors = (fields: Record<string, any>, validators: Record<string, (value: any) => ValidationResult>): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  Object.entries(fields).forEach(([field, value]) => {
    if (validators[field]) {
      const result = validators[field](value);
      if (!result.isValid && result.error) {
        errors[field] = result.error;
      }
    }
  });
  
  return errors;
};