import { A } from "@solidjs/router";
import { Title } from "solid-start";
import { HttpStatusCode } from "solid-start/server";

export default function Maybe() {
  return (
    <main>
      <Title>Not Found</Title>
      <HttpStatusCode code={404} />
      <h1>Page Not Found</h1>
      <A href="/">Home</A>
      <p>
        Visit{" "}
        <a href="https://start.solidjs.com" target="_blank">
          start.solidjs.com
        </a>{" "}
        to learn how to build SolidStart apps.
      </p>
    </main>
  );
}
