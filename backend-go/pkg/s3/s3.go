package s3

import (
	"context"
	"errors"
	"fmt"
	"mime/multipart"
	"os"
	"path/filepath"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/feature/s3/manager"
	s3service "github.com/aws/aws-sdk-go-v2/service/s3"
)

type S3Client struct {
	client     *s3service.Client
	uploader   *manager.Uploader
	bucketName string
	region     string
	endpoint   string
	publicURL  string
}

func NewS3Client() (*S3Client, error) {
	region := os.Getenv("AWS_REGION")
	if region == "" {
		region = "us-east-1"
	}
	accessKey := os.Getenv("AWS_ACCESS_KEY_ID")
	secretKey := os.Getenv("AWS_SECRET_ACCESS_KEY")
	bucket := os.Getenv("S3_BUCKET_NAME")
	endpoint := os.Getenv("AWS_ENDPOINT_URL")
	if endpoint == "" {
		endpoint = os.Getenv("S3_ENDPOINT")
	}
	publicURL := os.Getenv("S3_PUBLIC_URL")

	if bucket == "" || accessKey == "" || secretKey == "" {
		return nil, errors.New("Configurations missing: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, or S3_BUCKET_NAME")
	}

	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithRegion(region),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(accessKey, secretKey, "")),
	)

	if err != nil {
		return nil, fmt.Errorf("Unable to load AWS SDK config : %w", err)
	}

	// Configure S3 client options (supports MinIO / LocalStack / custom S3 endpoints)
	client := s3service.NewFromConfig(cfg, func(o *s3service.Options) {
		if endpoint != "" {
			o.BaseEndpoint = aws.String(endpoint)
			o.UsePathStyle = true
		}
	})
	uploader := manager.NewUploader(client)

	return &S3Client{
		client:     client,
		uploader:   uploader,
		bucketName: bucket,
		region:     region,
		endpoint:   endpoint,
		publicURL:  publicURL,
	}, nil
}

func (s *S3Client) UploadFile(fileHeader *multipart.FileHeader, folder string) (string, error) {
	file, err := fileHeader.Open()
	if err != nil {
		return "", err
	}
	defer file.Close()

	ext := filepath.Ext(fileHeader.Filename)
	uniquefilename := fmt.Sprintf("%s/%d_%s%s", folder,
		time.Now().UnixNano(),
		filepath.Base(fileHeader.Filename[:len(fileHeader.Filename)-len((ext))]),
		ext)

	uploadOutput, err := s.uploader.Upload(context.TODO(),
		&s3service.PutObjectInput{
			Bucket: aws.String(s.bucketName),
			Key:    aws.String(uniquefilename),
			Body:   file,
		})

	if err != nil {
		return "", err
	}

	// Return explicit public URL if configured (useful for local MinIO / public proxy)
	if s.publicURL != "" {
		return fmt.Sprintf("%s/%s/%s", s.publicURL, s.bucketName, uniquefilename), nil
	}

	if uploadOutput.Location != "" {
		return uploadOutput.Location, nil
	}

	if s.endpoint != "" {
		return fmt.Sprintf("%s/%s/%s", s.endpoint, s.bucketName, uniquefilename), nil
	}

	return fmt.Sprintf("https://%s.s3.%s.amazonaws.com/%s", s.bucketName, s.region, uniquefilename), nil
}
