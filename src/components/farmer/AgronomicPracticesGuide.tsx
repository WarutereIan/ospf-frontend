import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  IconSeeding,
  IconDroplet,
  IconSun,
  IconBug,
  IconCheck,
  IconAlertCircle,
  IconCalendar,
} from "@tabler/icons-react";

interface PracticeSection {
  title: string;
  icon: React.ReactNode;
  practices: {
    title: string;
    description: string;
    timing?: string;
  }[];
}

export function AgronomicPracticesGuide() {
  const practiceSections: PracticeSection[] = [
    {
      title: "Land Preparation",
      icon: <IconSeeding className="h-6 w-6" />,
      practices: [
        {
          title: "Soil Preparation",
          description: "Prepare well-drained, loose soil. OFSP prefers sandy loam soils with good organic matter.",
          timing: "2-3 weeks before planting",
        },
        {
          title: "Ridging",
          description: "Create ridges 30-40cm high and 75-100cm apart. This improves drainage and root development.",
          timing: "Before planting",
        },
        {
          title: "Weed Control",
          description: "Remove weeds before planting. Use manual weeding or approved herbicides.",
          timing: "Before and during early growth",
        },
      ],
    },
    {
      title: "Planting",
      icon: <IconCalendar className="h-6 w-6" />,
      practices: [
        {
          title: "Vine Cuttings",
          description: "Use healthy vine cuttings 25-30cm long with 4-5 nodes. Select from disease-free plants.",
          timing: "During rainy season",
        },
        {
          title: "Spacing",
          description: "Plant cuttings 30cm apart within rows, with rows 75-100cm apart.",
          timing: "At planting",
        },
        {
          title: "Planting Depth",
          description: "Plant 2-3 nodes underground, leaving 2-3 nodes above ground.",
          timing: "At planting",
        },
      ],
    },
    {
      title: "Water Management",
      icon: <IconDroplet className="h-6 w-6" />,
      practices: [
        {
          title: "Irrigation",
          description: "Water regularly during dry periods. OFSP needs consistent moisture, especially during root development.",
          timing: "Throughout growing season",
        },
        {
          title: "Drainage",
          description: "Ensure good drainage to prevent waterlogging, which can cause root rot.",
          timing: "Always",
        },
        {
          title: "Mulching",
          description: "Apply organic mulch to conserve moisture and suppress weeds.",
          timing: "After planting",
        },
      ],
    },
    {
      title: "Fertilizer Application",
      icon: <IconSeeding className="h-6 w-6" />,
      practices: [
        {
          title: "Organic Matter",
          description: "Apply well-decomposed compost or farmyard manure at 10-15 tons per hectare.",
          timing: "During land preparation",
        },
        {
          title: "NPK Fertilizer",
          description: "Apply 50-100kg NPK (17:17:17) per hectare, split into 2-3 applications.",
          timing: "At planting and 6-8 weeks after",
        },
        {
          title: "Top Dressing",
          description: "Apply nitrogen fertilizer (CAN) at 50kg per hectare 6-8 weeks after planting.",
          timing: "6-8 weeks after planting",
        },
      ],
    },
    {
      title: "Pest and Disease Management",
      icon: <IconBug className="h-6 w-6" />,
      practices: [
        {
          title: "Common Pests",
          description: "Watch for sweet potato weevils, aphids, and whiteflies. Use integrated pest management.",
          timing: "Throughout growing season",
        },
        {
          title: "Disease Control",
          description: "Prevent viral diseases by using clean planting material. Rotate crops to reduce disease pressure.",
          timing: "Prevention throughout season",
        },
        {
          title: "Early Detection",
          description: "Regularly inspect plants for signs of pests or diseases. Early intervention is key.",
          timing: "Weekly inspections",
        },
      ],
    },
    {
      title: "Harvesting",
      icon: <IconSun className="h-6 w-6" />,
      practices: [
        {
          title: "Maturity",
          description: "Harvest when roots are mature (3-5 months after planting). Check by gently digging around a plant.",
          timing: "3-5 months after planting",
        },
        {
          title: "Harvesting Method",
          description: "Use a fork or hoe to carefully lift roots. Avoid cutting or bruising the roots.",
          timing: "At maturity",
        },
        {
          title: "Curing",
          description: "Cure roots for 7-10 days in a warm, humid place to heal wounds and improve storage.",
          timing: "Immediately after harvest",
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <IconSeeding className="h-7 w-7 text-primary" />
            Recommended Agronomic Practices for OFSP
          </CardTitle>
          <CardDescription className="text-base">
            Follow these practices to produce high-quality Orange Fleshed Sweet Potatoes
          </CardDescription>
        </CardHeader>
      </Card>

      {practiceSections.map((section, sectionIndex) => (
        <Card key={sectionIndex}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              {section.icon}
              {section.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {section.practices.map((practice, practiceIndex) => (
                <div
                  key={practiceIndex}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg">{practice.title}</h3>
                    {practice.timing && (
                      <Badge variant="outline" className="ml-2">
                        {practice.timing}
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground text-base leading-relaxed">
                    {practice.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <IconAlertCircle className="h-6 w-6 text-blue-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-lg mb-2">Key Success Factors</h3>
              <ul className="space-y-2 text-base">
                <li className="flex items-start gap-2">
                  <IconCheck className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Use certified, disease-free planting material</span>
                </li>
                <li className="flex items-start gap-2">
                  <IconCheck className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Maintain consistent soil moisture throughout growth</span>
                </li>
                <li className="flex items-start gap-2">
                  <IconCheck className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Practice crop rotation to reduce pest and disease pressure</span>
                </li>
                <li className="flex items-start gap-2">
                  <IconCheck className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Harvest at the right maturity for best quality and yield</span>
                </li>
                <li className="flex items-start gap-2">
                  <IconCheck className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Handle roots carefully during harvest to avoid damage</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

