import { useState, useCallback } from "react";
import { Button } from "./components/ui/button";
import { useDropzone } from "react-dropzone";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Upload,
  Shield,
  CheckCircle,
  ExternalLink,
  Mail,
  User,
  ShoppingCart,
  CircleX,
} from "lucide-react";
import { FlickeringGrid } from "./components/magicui/flickering-grid";
import { LineShadowText } from "./components/magicui/line-shadow-text";
import { MagicCard } from "./components/magicui/magic-card";
import { AnimatedGridPattern } from "./components/magicui/animated-grid-pattern";
import { cn } from "./lib/utils";
import { modl_phownership_backend } from 'declarations/modl-phownership-backend';
import { findUser, verifyService } from "./services/verify.js";

function App() {
  const [greeting, setGreeting] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    const name = event.target.elements.name.value;
    modl_phownership_backend.greet(name).then((greeting) => {
      setGreeting(greeting);
    });
    return false;
  }

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [results, setResults] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const onDrop = useCallback(async (acceptedFiles) => {
    setUploadedFiles(acceptedFiles);
    setIsProcessing(true);

    const file = acceptedFiles[0];

    const verify = await verifyService(file);

    const result = {
      id: `result`,
      avatar: `/placeholder.svg?height=64&width=64&query=professional photographer avatar`,
      fullName: null,
      email: null,
      socialMedia: [
        {
          platform: "Instagram",
          url: "https://instagram.com/sarahjohnsonphoto",
        },
        { platform: "Twitter", url: "https://twitter.com/sarahj_photo" },
        { platform: "LinkedIn", url: "https://linkedin.com/in/sarahjohnson" },
      ],
      ecommerceLink: "google.com",
      verificationStatus: verify.status,
      uploadedImage: URL.createObjectURL(acceptedFiles[0]),
    };

    if (verify.status === "VERIFIED") {
      const user = await findUser(verify.owner_id);
      result.fullName = user.data.fullName;
      result.email = user.data.email;
      console.log(user);
    }

    setResults([result]);
    setIsProcessing(false);

    // verifyService(file)
    //   .then((res) => {
    //     console.log(res);

    //     // Create results based on the API response
    //     const mockResults = acceptedFiles.map((file, index) => ({
    //       id: `result-${index}`,
    //       avatar: `/placeholder.svg?height=64&width=64&query=professional photographer avatar`,
    //       fullName: index === 0 ? "Sarah Johnson" : "Michael Chen",
    //       email:
    //         index === 0
    //           ? "sarah.johnson@example.com"
    //           : "michael.chen@example.com",
    //       socialMedia: [
    //         {
    //           platform: "Instagram",
    //           url: "https://instagram.com/sarahjohnsonphoto",
    //         },
    //         { platform: "Twitter", url: "https://twitter.com/sarahj_photo" },
    //         {
    //           platform: "LinkedIn",
    //           url: "https://linkedin.com/in/sarahjohnson",
    //         },
    //       ],
    //       ecommerceLink:
    //         index === 0
    //           ? "https://sarahjohnsonprints.com"
    //           : "https://michaelchenart.com",
    //       verificationStatus: res.status,
    //       uploadedImage: URL.createObjectURL(file),
    //     }));

    //     setResults(mockResults);
    //     setIsProcessing(false);
    //   })
    //   .catch((error) => {
    //     console.error("Error verifying file:", error);
    //     setIsProcessing(false);
    //   });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    },
    multiple: true,
  });

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "verified":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "fail":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "verified":
        return <CheckCircle className="w-4 h-4" />;
      case "fail":
        return <CircleX className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  return (
    <>
      <div className="relative min-h-screen">
        <AnimatedGridPattern
          numSquares={100}
          maxOpacity={0.2}
          duration={1}
          repeatDelay={1}
          className={cn(
            "[mask-image:radial-gradient(100vw_circle_at_center,white,transparent)]",
            "inset-x-0 inset-y-[-30%] h-[100vh] skew-y-12"
          )}
        />
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="container flex h-16 items-center justify-between px-4">
            <div className="flex items-center space-x-2">
              <img src="/modl-logo.png" alt="Modl Logo" className="h-6" />
              <h1 className="text-xl font-bold text-balance">
                <LineShadowText className="italic text-2xl" shadowColor="black">
                  Verify
                </LineShadowText>
              </h1>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => (window.location.href = "https://dash.modl.app")}
            >
              <User className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold mb-4 text-balance">
              <LineShadowText
                className="italic text-8xl text-balance font-semibold leading-none tracking-tighter"
                shadowColor="black"
              >
                Verify
              </LineShadowText>{" "}
              Image Ownership
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              Upload your images to verify ownership and protect your creative
              work. Get detailed information about the original creator and
              their contact details.
            </p>
          </div>

          {/* Upload Area */}
          <Card className="p-0 w-full border-none mb-8 max-w-2xl mx-auto shadow-2xl">
            <MagicCard
              gradientColor="#ecf4f3"
              gradientFrom="#459187"
              gradientTo="#1e5450"
              className="p-0"
              gradientSize={200}
            >
              <CardContent className="p-8">
                <div
                  {...getRootProps()}
                  className={`
                border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
                ${
                  isDragActive
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                }
              `}
                >
                  <input {...getInputProps()} />
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  {isDragActive ? (
                    <p className="text-lg font-medium text-primary">
                      Drop your images here...
                    </p>
                  ) : (
                    <div>
                      <p className="text-lg font-medium mb-2">
                        Drag & drop images here, or click to select
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Supports JPG, PNG, GIF, WebP files
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </MagicCard>
          </Card>

          {/* Processing State */}
          {isProcessing && (
            <div className="text-center mb-8">
              <div className="inline-flex items-center space-x-2 text-primary">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="font-medium">
                  Verifying image ownership...
                </span>
              </div>
            </div>
          )}

          {/* Results */}
          {results.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-center mb-8 mt-18">
                Verification Results
              </h3>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1 max-w-4xl mx-auto">
                {results.map((result) => (
                  <Card key={result.id} className="overflow-hidden">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                          <img
                            src={result.uploadedImage || "/placeholder.svg"}
                            alt="Uploaded image"
                            className="w-16 h-16 rounded-lg object-cover border"
                          />
                          <div>
                            <CardTitle className="text-lg">
                              Image Verification
                            </CardTitle>
                            <Badge
                              variant="outline"
                              className={`mt-2 ${getStatusColor(
                                result.verificationStatus
                              )}`}
                            >
                              {getStatusIcon(result.verificationStatus)}
                              <span className="ml-1 capitalize">
                                {result.verificationStatus}
                              </span>
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    {result.fullName && (
                      <CardContent className="space-y-6">
                        {/* Owner Information */}
                        <div className="flex items-start space-x-4 p-4 bg-muted/50 rounded-lg">
                          <Avatar className="w-12 h-12">
                            <AvatarImage
                              src={result.avatar || "/placeholder.svg"}
                              alt={result.fullName}
                            />
                            <AvatarFallback>
                              {result.fullName
                                .split(" ")
                                .map((n) => n[0])
                                .join("").toUpperCase()}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 space-y-3">
                            <div>
                              <h4 className="font-semibold text-lg">
                                {result.fullName}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Original Creator
                              </p>
                            </div>

                            {/* Contact Information */}
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2 text-sm">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                <a
                                  href={`mailto:${result.email}`}
                                  className="text-primary hover:underline"
                                >
                                  {result.email}
                                </a>
                              </div>

                              {/* Social Media Links */}
                              <div className="flex flex-wrap gap-2">
                                {result.socialMedia.map((social, index) => (
                                  <Button
                                    key={index}
                                    variant="outline"
                                    size="sm"
                                    asChild
                                  >
                                    <a
                                      href={social.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs"
                                    >
                                      <ExternalLink className="w-3 h-3 mr-1" />
                                      {social.platform}
                                    </a>
                                  </Button>
                                ))}
                              </div>

                              {/* E-commerce Link */}
                              <Button
                                variant="default"
                                size="sm"
                                asChild
                                className="w-full mt-3"
                              >
                                <a
                                  href={result.ecommerceLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ShoppingCart className="w-4 h-4 mr-2" />
                                  Visit Store
                                </a>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {results.length === 0 &&
            !isProcessing &&
            uploadedFiles.length === 0 && (
              <div className="text-center py-12">
                <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Ready to Verify</h3>
                <p className="text-muted-foreground">
                  Upload images to start the ownership verification process
                </p>
              </div>
            )}
        </main>
      </div>
    </>
  );
}

export default App;
