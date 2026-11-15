# Country Search — Design Documentation

## Project Overview

Country Search is a browser-based TypeScript application that searches countries by name using the Countries API and renders matching results as interactive cards. The UI is created with the DOM API rather than a frontend framework.

**API endpoint:** `GET https://countries.dev/name/{query}`

The application supports debounced search, cancellation of obsolete requests, a request timeout, HTTP error handling, retrying a failed search, empty results, and expandable country cards.

## Architecture

The application separates API access, application coordination, data transformation, and DOM rendering:

| File                              | Responsibility                                                                         |
| --------------------------------- | -------------------------------------------------------------------------------------- |
| `src/main.ts`                     | Creates the initial page elements and calls `setupCountrySearch`.                      |
| `src/app.ts`                      | Coordinates input events, requests, cancellation, loading/error states, and rendering. |
| `src/api/searchCountries.ts`      | Performs the API request and handles HTTP response statuses.                           |
| `src/api/HttpError.ts`            | Defines an error type carrying an HTTP status code.                                    |
| `src/types/country.ts`            | Defines the API response shape and the application's `Country` type.                   |
| `src/utils/debounce.ts`           | Provides the reusable debounce utility.                                                |
| `src/utils/mapCountryResponse.ts` | Converts an API country object into the UI-facing data shape.                          |
| `src/ui/renderCountries.ts`       | Renders country cards with DOM methods.                                                |
| `src/styles.css`                  | Defines page layout, responsive styles, and expandable-card presentation.              |
| `src/tests/`                      | Contains unit and interaction tests using Vitest; DOM tests use jsdom.                 |

Data flow:

```text
User types in search input
  -> input event in app.ts
  -> cancel previous active request immediately
  -> debounce for 300 ms
  -> GET /name/{query}
  -> inspect HTTP response
  -> discard result if its signal was aborted
  -> mapCountryResponse() for each result
  -> renderCountries() updates the DOM
```

The `index.html` file loads the generated JavaScript module and CSS. The project uses the TypeScript compiler (`tsc`) without a JavaScript bundler. The generated `dist/` directory is a build artifact, not source code for review.

## Debounce

Search input is debounced by **300 milliseconds**. Every input event resets the debounce timer; the request begins only after the user pauses typing for that interval.

This avoids sending a request for every keystroke when the user types continuously. For example, rapidly entering `f`, `fr`, and `fra` usually triggers one request for `fra`, rather than three requests.

**Trade-off:** debounce introduces a small, intentional delay before the request starts. It does not cancel a request that has already started; cancellation is handled separately.

## Request Cancellation and Race Conditions

An `AbortController` tracks the current search. On every input event, the application calls `abort()` on the previous controller **immediately**, before waiting for the new debounce interval, and creates a controller for the new search.

The fetch request receives an `AbortSignal`. This lets a pending fetch reject when a newer search makes it obsolete.

A **race condition** can occur when an old request finishes after a newer one and overwrites the newer results. The application therefore also checks whether the request's combined signal has been aborted **after** the asynchronous API call completes and **before** rendering. If it has, that result is ignored. This guard matters even when a mocked or otherwise unusual asynchronous operation resolves despite cancellation.

`AbortError` is intentionally ignored: changing the search term is an expected user action, not an error to display.

## Timeout and Error Handling

Each search combines two cancellation signals using `AbortSignal.any()`:

- the active search controller's signal, for cancellation caused by newer input;
- `AbortSignal.timeout(5000)`, for a **5-second timeout**.

The API layer treats HTTP responses as follows:

- **Successful response:** parse the JSON array.
- **404:** return an empty array, interpreted by the UI as “No countries found.”
- **Other non-OK HTTP statuses:** throw `HttpError` with the HTTP status code.

The interface shows these states:

| Situation                       | UI behavior                                     |
| ------------------------------- | ----------------------------------------------- |
| Search is in progress           | `Loading countries...`                          |
| Matching countries found        | Render country cards.                           |
| Empty result                    | `No countries found.`                           |
| Timeout                         | Timeout message and a `Retry` button.           |
| Other request error             | General error message and a `Retry` button.     |
| Request superseded by new input | Ignore the cancelled request's error or result. |

The **Retry** button re-dispatches an input event for the current input value. This reuses the existing search logic, including a fresh controller and debounce, rather than duplicating request code.

## Data Mapping and Complexity

The API response is mapped into an application-specific `Country` representation. In particular, language objects containing a `name` are transformed into an array of language-name strings. This means DOM rendering does not need to know the API's nested language format.

For **n** returned countries, the outer mapping takes **O(n)** iterations. If country _i_ has **lᵢ** languages, mapping all languages adds **O(Σ lᵢ)** work; overall mapping complexity is **O(n + Σ lᵢ)** in time and for the newly constructed output data. If the number of languages per country is treated as bounded, this simplifies to **O(n)**.

Rendering creates a bounded number of DOM elements per country, so constructing the card list takes **O(n)** operations and **O(n)** DOM nodes for **n** countries. `replaceChildren()` clears previous results before inserting new cards, preventing accumulation of old cards.

The debounce utility keeps one timer reference, so its own retained state is **O(1)**. It reduces request frequency but does not change the algorithmic complexity of transforming an individual API response.

## Rendering and Accessibility

The UI is built with `document.createElement()`, `textContent`, `append()`, and `replaceChildren()`; this avoids interpolating API text into HTML strings.

Each card includes the country flag, name, capital, region, population, and languages. Details are shown or hidden by toggling the `expanded` CSS class. Population is formatted using `toLocaleString('en-US')`. The flag is displayed as a Unicode flag character rather than an image URL, matching the API value used by the application.

The search input has an accessible label. **A remaining accessibility improvement** is keyboard operability of the expandable cards: a click handler on an `<article>` alone does not give it native button behavior. A future iteration could use a real `<button>` or `<details>/<summary>` structure and expose the expanded state to assistive technology.

## Testing

The project uses **Vitest**. Tests that interact with the DOM run in **jsdom**. The Vitest configuration selects source tests from `src/tests/` so compiled copies under `dist/` are not executed again.

Current automated tests cover:

- debounce behavior;
- API success, 404, and other HTTP errors;
- the custom `HttpError`;
- API response mapping;
- immediate abort on input change;
- ignoring a stale response that arrives after cancellation;
- retry after an API failure;
- displaying a timeout message and Retry button when a timeout cancellation is simulated.

Tests replace the real `fetch` with a mock, so they do not depend on network availability. Fake timers control the debounce interval. For the timeout UI test, `AbortSignal.timeout()` is mocked and the test manually aborts its signal with a `TimeoutError`, because native timeout signals are not reliably advanced by Vitest's fake timers in this environment.

**Important test limitation:** the simulated-timeout test verifies **handling of a timeout error**, not the real passage of exactly five seconds. Browser-level verification of real timeout timing is a separate check.

At the latest verified run, **12 tests passed**.

Useful commands:

```bash
npm test          # run Vitest tests
npx tsc --noEmit  # type-check without emitting JavaScript
npx tsc           # compile TypeScript to dist/
```

## Clean Code Decisions

1. **Single responsibility:** API access, data mapping, DOM rendering, and search orchestration are implemented in separate modules.
2. **Descriptive naming:** functions such as `searchCountries`, `mapCountryResponse`, `renderCountries`, and `setupCountrySearch` communicate their purpose.
3. **Reusable utilities:** `debounce` is independent of the country API and UI.
4. **Explicit error handling:** 404 results, HTTP errors, user cancellation, and timeout are handled as distinct cases.
5. **Safe rendering:** user-facing strings are assigned with `textContent` rather than injected as HTML.
6. **Behavioral tests:** controlled mocked requests reproduce cancellation and stale-response ordering without requiring a live server.

## Known Limitations and Possible Improvements

- The API payload is currently asserted to match `CountryApiResponse` at the application boundary. A runtime validator would protect against unexpected API schema changes; TypeScript assertions alone do not validate external JSON.
- Expandable cards should receive keyboard and screen-reader support.
- More automated checks could cover empty queries, rapid clearing of input, request errors arriving out of order, and real-browser timeout behavior.
- The project does not currently claim caching or persistent storage.

## Build, Deployment, and Submission

The TypeScript compiler emits ES modules to `dist/`. Because there is **no bundler**, runtime relative imports use `.js` extensions so the browser can resolve compiled modules.

For a static deployment, the host must serve `index.html`, the compiled `dist/` files, the CSS, and any referenced assets with correct relative paths. Since `dist/` is excluded from Git, a deployment process must **build and publish the output**; enabling GitHub Pages directly on a source branch without a build/publish step is not sufficient.

**Deployment URL:** to be added after publication.

Before submitting the pull request, verify the assignment's **Pull Request Requirements**, check the deployed app, run the complete test suite and TypeScript check, and include the required task/deployment links and self-assessment in the PR description.
