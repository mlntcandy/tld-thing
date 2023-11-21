import { decode } from "punycode";

const LIST_URL = "https://data.iana.org/TLD/tlds-alpha-by-domain.txt";

export async function loadList() {
  const list = [];
  const response = await fetch(LIST_URL);
  const text = await response.text();
  const lines = text.split("\n");
  for (const line of lines) {
    if (line.startsWith("#")) continue;
    let name = line;
    // check punycode
    if (name.startsWith("XN--")) {
      try {
        name = decode(name);
      } catch (e) {}
    }
    list.push(line.toLowerCase());
  }
  return list;
}
