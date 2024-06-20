import { fetchPage } from "@/lib/sanity";

export default async function About() {
  const {heading, subheading} = await fetchPage("about");

  return (
    <>
      <h1>{heading}</h1>
      <h2>{subheading}</h2>
    </>
  );
}

