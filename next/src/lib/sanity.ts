import {createClient} from "next-sanity"

export async function fetchPage(page: "home"|"about") {
  const props: PageProps = (await client.fetch(
    `*[_type == "page" && lower(page) == "${page}" ]{ heading, subheading }`,
    {},
    {next: {
      revalidate: process.env.NODE_ENV == "development" ? 0 : 3600,
    }}
  ))[0]

  return props;
}

export type PageProps = {
  page: "home"|"about",
  heading: string, 
  subheading: string
}

const client = createClient({
  projectId: 'jgalqrm5',
  dataset: 'production',
  useCdn: false,
  apiVersion: "v2022-03-07"
});

