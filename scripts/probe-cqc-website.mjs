#!/usr/bin/env node
import { readFileSync } from "node:fs";

const id = process.argv[2] ?? "1-115000685";
const res = await fetch(`https://www.cqc.org.uk/location/${id}`);
const html = await res.text();

const websiteBlock = html.match(/Service's website[^<]*<a[^>]+href="([^"]+)"/i);
const anyExternal = [...html.matchAll(/href="(https?:\/\/[^"]+)"/gi)]
  .map((m) => m[1])
  .filter((u) => !u.includes("cqc.org.uk") && !u.includes("gov.uk/register"));

console.log("websiteBlock", websiteBlock?.[1]);
console.log("external", anyExternal.slice(0, 8));
