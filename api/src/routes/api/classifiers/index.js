import {
  basicInfoForClassifier,
  classifiers,
} from "../../../dataUtil/classifiersData.js";

import {
  extendedInfoForClassifier,
  runsForDivisionClassifier,
  chartData,
} from "../../../classifiers.api.js";

import { multisort } from "../../../../../shared/utils/sort.js";
import { PAGE_SIZE } from "../../../../../shared/constants/pagination.js";

const classifiersRoutes = async (fastify, opts) => {
  console.log("should have classifiers");
  fastify.get("/", (req, res) => classifiers.map(basicInfoForClassifier));

  fastify.get("/:division", (req, res) => {
    //console.profile();
    const { division } = req.params;
    const result = classifiers.map((c) => ({
      ...basicInfoForClassifier(c),
      ...extendedInfoForClassifier(c, division),
    }));
    //console.profileEnd();
    return result;
  });

  fastify.get("/:division/:number", (req, res) => {
    const { division, number } = req.params;
    const {
      sort,
      order,
      page: pageString,
      legacy,
      hhf: filterHHFString,
      club: filterClubString,
      filter: filterString,
    } = req.query;
    const includeNoHF = Number(legacy) === 1;
    const page = Number(pageString) || 1;
    const filterHHF = parseFloat(filterHHFString);
    const c = classifiers.find((cur) => cur.classifier === number);

    if (!c) {
      res.statusCode = 404;
      return { info: null, runs: [] };
    }

    const basic = basicInfoForClassifier(c);
    const extended = extendedInfoForClassifier(c, division);
    const { hhf, hhfs } = extended;

    let runsUnsorted = runsForDivisionClassifier({
      number,
      division,
      hhf,
      includeNoHF,
      hhfs,
    });
    if (filterHHF) {
      runsUnsorted = runsUnsorted.filter(
        (run) => Math.abs(filterHHF - run.historicalHHF) <= 0.00015
      );
    }
    if (filterString) {
      runsUnsorted = runsUnsorted.filter((run) =>
        [run.clubid, run.club_name, run.memberNumber, run.name]
          .join("###")
          .toLowerCase()
          .includes(filterString.toLowerCase())
      );
    }
    if (filterClubString) {
      runsUnsorted = runsUnsorted
        .filter((run) => run.clubid === filterClubString)
        .slice(0, 10);
    }
    const runs = multisort(
      runsUnsorted,
      sort?.split?.(","),
      order?.split?.(",")
    ).map((run, index) => ({ ...run, index }));

    return {
      info: {
        ...basic,
        ...extended,
      },
      runs: runs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
      runsTotal: runs.length,
      runsPage: page,
    };
  });

  fastify.get("/:division/:number/chart", (req, res) => {
    const { division, number } = req.params;
    const { full } = req.query;
    return chartData({ division, number, full });
  });
};

export default classifiersRoutes;
