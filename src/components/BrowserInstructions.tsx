import { Chrome, Globe, AlertCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";

const BrowserInstructions = () => {
  const getBrowser = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes("chrome") && !userAgent.includes("edg")) return "chrome";
    if (userAgent.includes("firefox")) return "firefox";
    if (userAgent.includes("safari") && !userAgent.includes("chrome")) return "safari";
    if (userAgent.includes("edg")) return "edge";
    return "unknown";
  };

  const browser = getBrowser();

  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        <p className="font-medium mb-3">
          Notifications are currently blocked. Follow these steps to enable them:
        </p>
        
        <Accordion type="single" collapsible className="w-full">
          {(browser === "chrome" || browser === "edge" || browser === "unknown") && (
            <AccordionItem value="chrome">
              <AccordionTrigger className="text-sm">
                <div className="flex items-center gap-2">
                  <Chrome className="h-4 w-4" />
                  {browser === "edge" ? "Microsoft Edge" : "Google Chrome / Edge"}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Click the <strong>lock icon</strong> 🔒 or <strong>info icon</strong> ⓘ in the address bar (left side)</li>
                  <li>Find <strong>"Notifications"</strong> in the dropdown menu</li>
                  <li>Change it from <strong>"Block"</strong> to <strong>"Allow"</strong></li>
                  <li>Refresh this page</li>
                </ol>
              </AccordionContent>
            </AccordionItem>
          )}
          
          {(browser === "firefox" || browser === "unknown") && (
            <AccordionItem value="firefox">
              <AccordionTrigger className="text-sm">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Mozilla Firefox
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Click the <strong>shield icon</strong> 🛡️ or <strong>lock icon</strong> 🔒 in the address bar</li>
                  <li>Click <strong>"Site Information"</strong> → <strong>"More Information"</strong></li>
                  <li>Go to the <strong>"Permissions"</strong> tab</li>
                  <li>Find <strong>"Show Notifications"</strong> and uncheck <strong>"Use Default"</strong></li>
                  <li>Select <strong>"Allow"</strong></li>
                  <li>Refresh this page</li>
                </ol>
              </AccordionContent>
            </AccordionItem>
          )}
          
          {(browser === "safari" || browser === "unknown") && (
            <AccordionItem value="safari">
              <AccordionTrigger className="text-sm">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Safari (macOS)
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Open <strong>Safari</strong> → <strong>Settings</strong> (or Preferences)</li>
                  <li>Click the <strong>"Websites"</strong> tab</li>
                  <li>Select <strong>"Notifications"</strong> in the left sidebar</li>
                  <li>Find this website in the list</li>
                  <li>Change permission to <strong>"Allow"</strong></li>
                  <li>Refresh this page</li>
                </ol>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </AlertDescription>
    </Alert>
  );
};

export default BrowserInstructions;