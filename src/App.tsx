import { useEffect, useState } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { loadList } from "@/lib/tld";
import { ModeToggle } from "@/components/mode-toggle";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Variant, getCombos } from "@/lib/scan";

function App() {
  const [domains, setDomains] = useState<string[]>([]);
  const [domainCombos, setDomainCombos] = useState<Variant[]>([]);

  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    loadList().then(setDomains);
  }, []);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <ModeToggle />
      <h1>tld thing</h1>
      {domains.length === 0 && <p>loading...</p>}
      {domains.length > 0 && (
        <>
          <p>loaded {domains.length} TLDs</p>
          <div className="flex gap-2">
            <Input
              placeholder="enter your word"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button
              onClick={() => {
                setDomainCombos([]);
                setDomainCombos(getCombos(search, domains));
              }}
            >
              go
            </Button>
          </div>
          <ul>
            {domainCombos.map((combo) => (
              <li key={combo[0]} className="flex gap-1">
                <span>{combo[0]}</span>
                <span className="text-gray-400">{combo[1]}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </ThemeProvider>
  );
}

export default App;
