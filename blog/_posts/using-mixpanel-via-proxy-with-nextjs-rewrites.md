---
title: Using Mixpanel via proxy with Next.js rewrites
lang: en-US
date: 2022-03-26
published: false
description: A simple way to use Next.js rewrites for proxying Mixpanel requests
tags:
  - react
  - nextjs
  - javascript
  - mixpanel
cover_image: https://dev-to-uploads.s3.amazonaws.com/uploads/articles/78i5lf4emm0wa6elr5qw.jpg
---

## Quick Overview

[Mixpanel](https://mixpanel.com) has great documentation for setting up your project in many different languages, including JavaScript. They also provide docs and examples for implenting tracking with a proxy. Setting up Mixpanel through a proxy is useful to bypass ad and tracking blockers, and is a nice way to keep all client requests through your domain.

I didn't see any great resources out there for setting up Mixpanel specifically in [Next.js](https://nextjs.org/) using their built-in Rewrites feature to accomplish the same goal as setting up a proxy. Using rewrites, I was able to keep all Mixpanel requests going through the same domain as my website/app, and didn't need to deal with configuring Nginx myself (I'm hosting on Vercel, so I don't normally have to touch webserver config).

This is how I implemented that setup.

## Step 1: Install Mixpanel's JS SDK

We are going to use Mixpanel's JS SDK `mixpanel-browser`. You can install it with npm/yarn as follows.

```bash
# npm
npm install --save mixpanel-browser
# yarn
yarn add mixpanel-browser
```

If you're using TypeScript, you can also install `@types/mixpanel-browser` to have typings.

## Step 2: Create Mixpanel wrapper function

**Note** - This post is to explain the setup for using Next rewrites. I used [this article](https://medium.com/@andrewoons/setting-up-mixpanel-in-react-3e4c5b8c2a36) as a guide for creating a basic Mixpanel wrapper function.

Create a file called `mixpanel.{ts|js}` wherever it makes sense in your project. We will be defining an object which will be imported and used anywhere you plan to implement Mixpanel tracking.

```typescript
// Remove { Dict, Query } if not using TypeScript
import mixpanel, { Dict, Query } from "mixpanel-browser";

const isProd = process.env.NODE_ENV === "production";

mixpanel.init("YOUR_MIXPANEL_TOKEN", {
  // Use your project's URL, adding a slug for all Mixpanel requests
  api_host: "https://yourdomain.com/mp",
});

export const Mixpanel = {
  identify: (id: string) => {
    mixpanel.identify(id);
  },
  alias: (id: string) => {
    mixpanel.alias(id);
  },
  track: (name: string, props?: Dict) => {
    mixpanel.track(name, props);
  },
  track_links: (query: Query, name: string) => {
    mixpanel.track_links(query, name, {
      referrer: document.referrer,
    });
  },
  people: {
    set: (props: Dict) => {
      mixpanel.people.set(props);
    },
  },
};
```

First we import the `mixpanel-browser` library.

When in initialize it, we specify our own `api_host`. This is where we tell Mixpanel to use our URL instead of theirs. This url should be the same as your Next.js project's URL, with a specific slug which will be dedicated to only Mixpanel requests (e.g. `/mp`). You can make this whatever you want it to be, so long as it is not used anywhere else in your project.

## Step 3: Add rewrites

Now we need to tell Next to handle the rewrites for the URL we just provided to Mixpanel.

In `next.config.js` add the following (yours might have additional configs already, the rewrites is what we care about).

```javascript
/** @type {import('next').NextConfig} */
module.exports = {
  async rewrites() {
    return [
      {
        source: "/mp/lib.min.js",
        destination: "https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js",
      },
      {
        source: "/mp/lib.js",
        destination: "https://cdn.mxpnl.com/libs/mixpanel-2-latest.js",
      },
      {
        source: "/mp/decide",
        destination: "https://decide.mixpanel.com/decide",
      },
      {
        source: "/mp/:slug",
        // use "api-eu.mixpanel.com" if you need to use EU servers
        destination: "https://api.mixpanel.com/:slug",
      },
    ];
  },
};
```

This tells Next, when a request is made to each of these endpoints, it will perform a rewrite to the `destination` URL. You can find more details about these rewrites in [Next's documentation](https://nextjs.org/docs/api-reference/next.config.js/rewrites).

## Step 4: Track things

Now you can use your Mixpanel object throughout your Next project. Import it using `import { Mixpanel } from './mixpanel';`

Then use it to track events, link clicks, and anything else useful. (These are just examples, not indicative of useful events to track).

```tsx

import { useEffect } from "react";
import Link from "next/link";
import { Mixpanel } from "./path/to/mixpanel";

const PageName = () => {
  useEffect(() => {
    Mixpanel.track("Loaded PageName");
    Mixpanel.track_links("#nav a", "Nav link clicked");
  }, []);

  const handleButtonClick = () => {
    Mixpanel.track("Button clicked");
    alert("Button clicked!");
  };

  return (
    <div className="container">
      <div id="nav">
        <Link href="/dashboard">
          <a>Home</a>
        </Link>
        <Link href="/about">
          <a>About</a>
        </Link>
        <Link href="/pricing">
          <a>Pricing</a>
        </Link>
      </div>

      <button onClick={handleButtonClick}>Click me!</button>
    </div>
  );
};

export default PageName;
```

## Wrapping up

There you have it. All requests for Mixpanel should now be going through your app's domain, effectively working as a proxy using Next's built-in Rewrites capabilities.

Let me know if this worked for you, or if you have suggestions for a better approach in the comments!
