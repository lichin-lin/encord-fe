import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    description: "Detected objects",
    predictions: [
      {
        bbox: {
          x1: 589,
          x2: 1443,
          y1: 92,
          y2: 927,
        },
        label: "orange",
        score: "0.97",
      },
      {
        bbox: {
          x1: -1,
          x2: 1617,
          y1: 25,
          y2: 1193,
        },
        label: "bowl",
        score: "0.29",
      },
      {
        bbox: {
          x1: -3,
          x2: 801,
          y1: 1,
          y2: 204,
        },
        label: "person",
        score: "0.28",
      },
    ],
  });
}