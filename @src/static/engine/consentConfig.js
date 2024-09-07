window.CookieConsent.init({
  // More link URL on bar.
  modalMainTextMoreLink: null,
  // How long to wait until bar comes up.
  barTimeout: 1000,
  // Look and feel.
  theme: {
    barColor: '#fff',
    barTextColor: '#000',
    barMainButtonColor: '#000',
    barMainButtonTextColor: '#fff',
    modalMainButtonColor: '#4285F4',
    modalMainButtonTextColor: '#FFF',
  },
  language: {
    // Current language.
    current: 'en',
    locale: {
      en: {
        barMainText: 'This website uses cookies to ensure you get the best experience on my website.',
        closeAriaLabel: 'close',
        barLinkSetting: 'Cookie Settings',
        barBtnAcceptAll: 'Accept all cookies',
        modalMainTitle: 'Cookie settings',
        modalMainText: 'Cookies are small pieces of data sent from a website and stored on the user\'s computer by the user\'s web browser while the user is browsing. Your browser stores each message in a small file, called cookie. When you request another page from the server, your browser sends the cookie back to the server. Cookies were designed to be a reliable mechanism for websites to remember information or to record the user\'s browsing activity.',
        modalBtnSave: 'Save current settings',
        modalBtnAcceptAll: 'Accept all cookies and close',
        modalAffectedSolutions: 'Affected solutions:',
        learnMore: 'Learn More',
        on: 'On',
        off: 'Off',
        enabled: 'is enabled.',
        disabled: 'is disabled.',
        checked: 'checked',
        unchecked: 'unchecked',
      },
      hu: {
        barMainText: 'Ez a weboldal Sütiket használ a jobb felhasználói élmény érdekében.',
        closeAriaLabel: 'bezár',
        barLinkSetting: 'Süti beállítások',
        barBtnAcceptAll: 'Minden süti elfogadása',
        modalMainTitle: 'Süti beállítások',
        modalMainText: 'A HTTP-süti (általában egyszerűen süti, illetve angolul cookie) egy információcsomag, amelyet a szerver küld a webböngészőnek, majd a böngésző visszaküld a szervernek minden, a szerver felé irányított kérés alkalmával. Amikor egy weboldalt kérünk le a szervertől, akkor a böngésző elküldi a számára elérhető sütiket. A süti-ket úgy tervezték, hogy megbízható mechanizmust biztosítsanak a webhelyek számára az információk megőrzésére vagy a felhasználók böngészési tevékenységének rögzítésére.',
        modalBtnSave: 'Beállítások mentése',
        modalBtnAcceptAll: 'Minden Süti elfogadása',
        modalAffectedSolutions: 'Mire lesz ez hatással:',
        learnMore: 'Tudj meg többet',
        on: 'Be',
        off: 'Ki',
        enabled: 'bekapcsolva.',
        disabled: 'kikapcsolva.',
        checked: 'kipipálva',
        unchecked: 'nincs kipipálva',
      }
    }
  },
  // List all the categories you want to display.
  categories: {
    // Unique name.
    // This probably will be the default category.
    necessary: {
      // The cookies here are necessary and category can't be turned off.
      // Wanted config value will be ignored.
      needed: true,
      // The cookies in this category will be let trough.
      // This probably should be false if category not necessary.
      wanted: true,
      // If checkbox is on or off at first run.
      checked: true,
      // Language settings for categories.
      language: {
        locale: {
          en: {
            name: 'Strictly Necessary Cookies',
            description: 'These cookies are essential to provide you with services available through my website and to enable you to use certain features of my website. Without these cookies, I cannot provide you certain services on my website.',
          },
          hu: {
            name: 'Szükséges sütik',
            description: 'These cookies are essential to provide you with services available through my website and to enable you to use certain features of my website. Without these cookies, I cannot provide you certain services on my website.',
          }
        }
      }
    }
  },
  // List actual services here.
  services: {
    // Unique name.
    analytics: {
      // Existing category Unique name.
      // This example shows how to block Google Analytics.
      category: 'necessary',
      // Type of blocking to apply here.
      // This depends on the type of script we are trying to block.
      // Can be: dynamic-script, script-tag, wrapped, localcookie.
      type: 'dynamic-script',
      // Only needed if "type: dynamic-script".
      // The filter will look for this keyword in inserted scipt tags
      //  and block if match found.
      search: 'analytics',
      // List of known cookie names or regular expressions matching
      //  cookie names placed by this service.
      // These will be removed from current domain and .domain.
      cookies: [{
        // Known cookie name.
        name: '_gid',
        // Expected cookie domain.
        domain: `.${window.location.hostname}`
      }, {
        // Regex matching cookie name.
        name: /^_ga/,
        domain: `.${window.location.hostname}`
      }],
      language: {
        locale: {
          en: {
            name: 'Google Analytics'
          },
          hu: {
            name: 'Google Analytics'
          }
        }
      }
    }
  }
})
