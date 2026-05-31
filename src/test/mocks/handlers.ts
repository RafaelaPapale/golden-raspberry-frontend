import { http, HttpResponse } from "msw";

const BASE = "https://challenge.outsera.tech/api/movies";

const ALL_MOVIES = [
  {
    id: 1,
    year: 1984,
    title: "Bolero",
    studios: ["MGM/UA Entertainment"],
    producers: ["A. Cannon", "W. Hudson"],
    winner: true,
  },
  {
    id: 2,
    year: 1985,
    title: "Rambo: First Blood Part II",
    studios: ["TriStar Pictures"],
    producers: ["Buzz Feitshans"],
    winner: false,
  },
  {
    id: 3,
    year: 1986,
    title: "Howard the Duck",
    studios: ["Universal Pictures"],
    producers: ["Gloria Katz"],
    winner: true,
  },
];

export const handlers = [
  http.get(BASE, ({ request }) => {
    const url = new URL(request.url);
    const winnerRaw = url.searchParams.get("winner");
    const yearRaw = url.searchParams.get("year");

    let movies = [...ALL_MOVIES];
    if (winnerRaw === "true") movies = movies.filter((m) => m.winner);
    if (winnerRaw === "false") movies = movies.filter((m) => !m.winner);
    if (yearRaw) movies = movies.filter((m) => m.year === Number(yearRaw));

    return HttpResponse.json({
      content: movies,
      totalElements: movies.length,
      totalPages: 1,
      number: 0,
      size: 15,
      first: true,
      last: true,
      numberOfElements: movies.length,
    });
  }),

  http.get(`${BASE}/yearsWithMultipleWinners`, () =>
    HttpResponse.json({
      years: [
        { year: 1986, winnerCount: 2 },
        { year: 1990, winnerCount: 3 },
      ],
    })
  ),

  http.get(`${BASE}/studiosWithWinCount`, () =>
    HttpResponse.json({
      studios: [
        { name: "Columbia Pictures", winCount: 7 },
        { name: "Paramount Pictures", winCount: 6 },
        { name: "Warner Bros.", winCount: 5 },
        { name: "Universal Pictures", winCount: 3 },
      ],
    })
  ),

  http.get(`${BASE}/maxMinWinIntervalForProducers`, () =>
    HttpResponse.json({
      min: [
        {
          producer: "Joel Silver",
          interval: 1,
          previousWin: 1990,
          followingWin: 1991,
        },
      ],
      max: [
        {
          producer: "Matthew Vaughn",
          interval: 13,
          previousWin: 2002,
          followingWin: 2015,
        },
      ],
    })
  ),

  http.get(`${BASE}/winnersByYear`, ({ request }) => {
    const year = new URL(request.url).searchParams.get("year");
    if (year === "1984") {
      return HttpResponse.json([ALL_MOVIES[0]]);
    }
    return HttpResponse.json([]);
  }),
];
