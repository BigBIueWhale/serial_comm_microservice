use tonic::{transport::Server, Request, Response, Status};

pub mod calculator {
    tonic::include_proto!("calculator");
}

use calculator::{calculator_server::{Calculator, CalculatorServer}, TangentRequest, TangentResponse};

#[derive(Default)]
pub struct MyCalculator {}

#[tonic::async_trait]
impl Calculator for MyCalculator {
    async fn calc_tangent(
        &self,
        request: Request<TangentRequest>,
    ) -> Result<Response<TangentResponse>, Status> {
        let number = request.into_inner().number;
        let response = if number.is_finite() {
            TangentResponse {
                result: Some(calculator::tangent_response::Result::Value(number.tan())),
            }
        } else {
            TangentResponse {
                result: Some(calculator::tangent_response::Result::Error("Invalid number".into())),
            }
        };
        Ok(Response::new(response))
    }
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let addr = "[::1]:50051".parse()?;
    let calculator = MyCalculator::default();

    Server::builder()
        .add_service(CalculatorServer::new(calculator))
        .serve(addr)
        .await?;

    Ok(())
}
