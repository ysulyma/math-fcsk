import * as Tabs from "@radix-ui/react-tabs";

const TABS = ["fp-single", "fp-table"] as const;
const tabTitles = {
  "fp-single": (
    <>
      <$>{raw`\K_*(R;\F_p)`}</$> ring structure (individual)
    </>
  ),
  "fp-table": (
    <>
      <$>{raw`\K_*(R;\F_p)`}</$> ring structure (table)
    </>
  ),
};
export type Tab = (typeof TABS)[number];

export function TabBar({setTab}: {setTab: React.Dispatch<Tab>}) {
  return (
    <Tabs.Root>
      <Tabs.List>
        <Tabs.Trigger />
      </Tabs.List>
      <Tabs.Content />
    </Tabs.Root>
  );
}
