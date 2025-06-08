
import { useState, useEffect } from 'react';

export function useUtmUrl(
  baseUrlInput: string,
  utmSource: string,
  utmMedium: string,
  utmCampaign: string
): { generatedUrl: string } {
  const [generatedUrl, setGeneratedUrl] = useState<string>('');

  useEffect(() => {
    const baseUrl = baseUrlInput.trim();
    if (!baseUrl) {
      setGeneratedUrl('');
      return;
    }

    // Attempt to normalize baseUrl by adding https:// if no scheme is present
    let normalizedBaseUrl = baseUrl;
    if (!/^(\w+:)?\/\//.test(baseUrl)) { // Does not start with scheme:// or //
        normalizedBaseUrl = `https://${baseUrl}`;
    }
    
    try {
      const url = new URL(normalizedBaseUrl);
      const params = new URLSearchParams(url.search); // Preserve existing params from base URL

      if (utmSource.trim()) params.set('utm_source', utmSource.trim());
      else params.delete('utm_source'); // Remove if empty to keep URL clean

      if (utmMedium.trim()) params.set('utm_medium', utmMedium.trim());
      else params.delete('utm_medium');

      if (utmCampaign.trim()) params.set('utm_campaign', utmCampaign.trim());
      else params.delete('utm_campaign');
      
      url.search = params.toString();
      setGeneratedUrl(url.toString());

    } catch (error) {
      // Fallback for invalid URLs that new URL() cannot parse (e.g. just a domain without TLD)
      // This fallback is simpler and might not handle all edge cases perfectly
      let tempUrl = baseUrl; // Use original user input for fallback
      const queryParams: string[] = [];

      // Check if base URL already has query parameters
      const existingQueryString = tempUrl.includes('?') ? tempUrl.substring(tempUrl.indexOf('?') + 1) : '';
      const existingParams = new URLSearchParams(existingQueryString);


      if (utmSource.trim()) existingParams.set('utm_source', utmSource.trim());
      else existingParams.delete('utm_source');
      
      if (utmMedium.trim()) existingParams.set('utm_medium', utmMedium.trim());
      else existingParams.delete('utm_medium');

      if (utmCampaign.trim()) existingParams.set('utm_campaign', utmCampaign.trim());
      else existingParams.delete('utm_campaign');
      
      const finalParamsString = existingParams.toString();

      if (finalParamsString) {
        if (tempUrl.includes('?')) {
          tempUrl = `${tempUrl.substring(0, tempUrl.indexOf('?'))}?${finalParamsString}`;
        } else {
          tempUrl = `${tempUrl}?${finalParamsString}`;
        }
      } else {
        // If no params, remove '?' if it was there and now empty
         if (tempUrl.includes('?')) {
          tempUrl = tempUrl.substring(0, tempUrl.indexOf('?'));
        }
      }
      setGeneratedUrl(tempUrl);
    }
  }, [baseUrlInput, utmSource, utmMedium, utmCampaign]);

  return { generatedUrl };
}
